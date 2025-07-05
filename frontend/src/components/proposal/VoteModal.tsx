import { FC, useRef, useEffect } from "react";
import { Proposal } from "../../types";
import { ConnectButton, useCurrentWallet, useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { useNetworkVariable } from "../../config/networkConfig";
import { Transaction } from "@mysten/sui/transactions";
import { toast } from "react-toastify";

interface VoteModalProps {
    proposal: Proposal;
    hasVoted: boolean
    isOpen: boolean;
    onClose: () => void;
    onVote: (votedYes: boolean) => void;
};

export const VoteModal: FC<VoteModalProps> = ({
    proposal,
    hasVoted,
    isOpen,
    onClose,
    onVote,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { connectionStatus } = useCurrentWallet();
  const suiClient = useSuiClient();
  const { mutate: signAndExecute, isPending, isSuccess, reset } = useSignAndExecuteTransaction();
  const packageId = useNetworkVariable("packageId");
  const toastId = useRef<number | string>();

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle escape key to close
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const showToast = (message: string) => {
    toastId.current = toast(message, {autoClose: false});
  };

  const dismissToast = (message: string) => {
    toast.dismiss(toastId.current);
    toast(message, {autoClose: 2000});
  }

  const vote = (voteYes: boolean) => {
    const tx = new Transaction();
    tx.moveCall({
      arguments: [
        tx.object(proposal.id.id),
        tx.pure.bool(voteYes),
        tx.object("0x6")
      ],
      target: `${packageId}::proposal::vote`
    });

    showToast("Processing transaction...");
    signAndExecute({
      transaction: tx as any, // Type assertion to any to avoid type issues
      }, {
        onError: () => {
          alert("Error signing transaction");
          dismissToast("Transaction failed");
        },
        onSuccess: async ({digest}) => {

         await suiClient.waitForTransaction({
            digest,
            options: {
              showEffects: true,
            },
          });

          const eventsResults = await suiClient.queryEvents({
              query: {Transaction: digest}
          })

          if(eventsResults.data.length > 0) {
            const firstEvent = eventsResults.data[0].parsedJson as {
              proposal_id?: string,
              voter?: string,
              vote_yes?: boolean,
            };

            const id = firstEvent.proposal_id || "No event found for given criteria";
            const voter = firstEvent.voter || "No event found for given criteria";
            const voteYes = firstEvent.vote_yes || "No event found for given criteria";

            console.log("Event captured")
            console.log(id, voter, voteYes);

          } else {
            console.log("No events found");
          }

          // const objectId = effects?.created?.[0]?.reference?.objectId;
          reset();
          dismissToast("Transaction successful");
          onVote(voteYes);
        },
      }
    );

    // all package module used in the modules all have specific addresses, the address for the clock module is 0x6
    // apis for accessingtime from move calls, via the clock: a unique shared object that is created at 0x6 during genesis.
    
  }

  const votingDisabled = hasVoted || isPending || isSuccess;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        ref={modalRef}
        className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4"
      >
        
        <div className="flex items-start justify-between">
            <h2 className="text-2xl font-bold mb-4">{proposal.title}</h2>
          {
            hasVoted || isSuccess ? (
              <div className="w-20 text-sm p-1 font-medium rounded-full bg-green-300 text-gray-600 text-center">
                  Voted
              </div>
            ): <div className="w-13 text-sm p-2 font-medium rounded-full bg-red-300 text-gray-800 text-center">
                  No vote
              </div>
          }
        </div>

        <p className="mb-6 text-gray-700 dark:text-gray-300">{proposal.description}</p>
        <div className="flex flex-col gap-4">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>👍Yes votes: {proposal.votedYesCount}</span>
            <span>👎No votes: {proposal.votedNoCount}</span>
          </div>
          <div className="flex justify-between gap-4">

            {connectionStatus === "connected" ? 
            <>
                <button
                    disabled={votingDisabled}
                    onClick={() => vote(true)}
                    className="flex-1 bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition-colors 
                                disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Vote Yes
                </button>
                <button
                    disabled={votingDisabled}
                    onClick={() => vote(false)}
                    className="flex-1 bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 transition-colors 
                            disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Vote No
                </button>
            </>  : 
            
              <div>
                <ConnectButton connectText="Connect to Vote"/>
              </div>
            
            }

          </div>
          <button
            onClick={onClose}
            className="w-full border border-gray-300 dark:border-gray-600 px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};