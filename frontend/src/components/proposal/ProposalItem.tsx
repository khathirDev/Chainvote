import { useSuiClientQuery } from "@mysten/dapp-kit";
import { FC, useState } from "react";
import { SuiObjectData } from "@mysten/sui/client";
import { Proposal, VoteNft } from "../../types";
import { VoteModal } from "./VoteModal";

interface ProposalItemProps  {
    id: string;
    voteNft: VoteNft | undefined;
    onVoteTxSuccess: () => void;
};

export const ProposalItem: FC<ProposalItemProps> = ({id, voteNft, onVoteTxSuccess}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const {data: dataResponse, refetch: refetchProposals, error, isPending} = useSuiClientQuery("getObject", {
        id,
        options: {
            showContent: true,
        }
    });

    if(isPending) return (
        <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 animate-pulse">
            <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-400"></div>
            </div>
        </div>
    );

    if(error) return (
        <div className="bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <p className="text-red-300 font-medium">Error loading proposal</p>
            </div>
        </div>
    );

    if(!dataResponse.data) return null;

    const proposal = parseProposals(dataResponse.data);
    if(!proposal) return (
        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 rounded-2xl p-6">
            <p className="text-slate-400 text-center">No proposal found</p>
        </div>
    );

    const expiration = proposal.expiration;
    const isDelisted = proposal.status.variant === "Delisted";
    const isExpired = isUnixTimeExpired(expiration) || isDelisted;
    const totalVotes = proposal.votedYesCount + proposal.votedNoCount;
    const yesPercentage = totalVotes > 0 ? (proposal.votedYesCount / totalVotes) * 100 : 0;

    return (
        <>
            <div 
                onClick={() => !isExpired && setIsModalOpen(true)}
                className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${
                    isExpired 
                        ? "cursor-not-allowed border-slate-700/50 bg-slate-800/20 opacity-75" 
                        : "cursor-pointer border-slate-700/50 bg-slate-800/40 hover:border-blue-500/50 hover:bg-slate-800/60 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1"
                } backdrop-blur-sm`}
            >
                
                {!isExpired && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                )}

                {/* Status indicator */}
                {isExpired && (
                    <div className="absolute top-4 right-4 bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-xs font-medium border border-red-500/30">
                        {isDelisted ? "Delisted" : "Expired"}
                    </div>
                )}

                {/* Vote NFT indicator */}
                {voteNft && (
                    <div className="absolute top-4 left-4 bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-xs font-medium border border-green-500/30 flex items-center gap-2">
                        <img className="w-4 h-4 rounded-full" src={voteNft.url} alt="Vote NFT" />
                        <span>Voted</span>
                    </div>
                )}

                <div className="relative p-6">
                    {/* Header */}
                    <div className="mb-4">
                        <h3 className={`text-xl font-bold mb-2 line-clamp-2 ${
                            isExpired ? "text-slate-500" : "text-white group-hover:text-blue-100"
                        }`}>
                            {proposal.title}
                        </h3>
                        
                        <p className={`text-sm leading-relaxed line-clamp-3 ${
                            isExpired ? "text-slate-600" : "text-slate-300"
                        }`}>
                            {proposal.description}
                        </p>
                    </div>

                    {/* Voting Progress Bar */}
                    <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className={`text-xs font-medium ${
                                isExpired ? "text-slate-600" : "text-slate-400"
                            }`}>
                                Voting Progress
                            </span>
                            <span className={`text-xs ${
                                isExpired ? "text-slate-600" : "text-slate-400"
                            }`}>
                                {totalVotes} total votes
                            </span>
                        </div>
                        
                        <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                            <div 
                                className={`h-full rounded-full transition-all duration-500 ${
                                    yesPercentage > 50 
                                        ? "bg-gradient-to-r from-green-400 to-emerald-500" 
                                        : "bg-gradient-to-r from-red-400 to-rose-500"
                                }`}
                                style={{ width: `${Math.max(yesPercentage, 5)}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Vote counts */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${
                                isExpired 
                                    ? "bg-green-500/10 text-green-700" 
                                    : "bg-green-500/20 text-green-300 border border-green-500/30"
                            }`}>
                                <div className="w-2 h-2 bg-current rounded-full"></div>
                                <span className="font-semibold text-sm">{proposal.votedYesCount}</span>
                                <span className="text-xs opacity-75">Yes</span>
                            </div>
                            
                            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${
                                isExpired 
                                    ? "bg-red-500/10 text-red-700" 
                                    : "bg-red-500/20 text-red-300 border border-red-500/30"
                            }`}>
                                <div className="w-2 h-2 bg-current rounded-full"></div>
                                <span className="font-semibold text-sm">{proposal.votedNoCount}</span>
                                <span className="text-xs opacity-75">No</span>
                            </div>
                        </div>

                        {/* Winning indicator */}
                        {totalVotes > 0 && (
                            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
                                proposal.votedYesCount > proposal.votedNoCount
                                    ? "bg-green-500/20 text-green-300"
                                    : "bg-red-500/20 text-red-300"
                            }`}>
                                {proposal.votedYesCount > proposal.votedNoCount ? "Leading" : "Trailing"}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                        <div className={`text-xs ${
                            isExpired ? "text-slate-600" : "text-slate-400"
                        }`}>
                            {isDelisted ? (
                                <span className="text-red-400">Proposal Delisted</span>
                            ) : (
                                formatUnixTime(expiration)
                            )}
                        </div>

                        {!isExpired && (
                            <div className="flex items-center gap-2 text-blue-400 text-xs font-medium group-hover:text-blue-300">
                                <span>Vote Now</span>
                                <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        )}
                    </div>
                </div>

                {/* Interactive hover effect */}
                {!isExpired && (
                    <div className="absolute inset-0 border border-blue-500/0 group-hover:border-blue-500/30 rounded-2xl transition-all duration-300 pointer-events-none"></div>
                )}
            </div>

            <VoteModal 
                proposal={proposal} 
                hasVoted={!!voteNft}
                isOpen={isModalOpen} 
                onClose={() => { setIsModalOpen(false)}}
                onVote={(votedYes: boolean) => {
                    console.log(votedYes);
                    refetchProposals();
                    onVoteTxSuccess();
                    setIsModalOpen(false);
                }}
            />
        </>
    );
};

function parseProposals(data: SuiObjectData): Proposal | null {
    if (data.content?.dataType !== "moveObject") return null;

    const {
        voted_yes_count,
        voted_no_count,
        expiration,
        title,
        description,
        ...rest
    } = data.content.fields as any;

    return {
        ...rest,
        title: String(title),
        description: String(description),
        votedYesCount: Number(voted_yes_count),
        votedNoCount: Number(voted_no_count),
        expiration: Number(expiration)
    };
}

function isUnixTimeExpired(unixTime: number) {
    return new Date(unixTime) < new Date();
}

function formatUnixTime(unixTime: number) {
    if (isUnixTimeExpired(unixTime)) {
        return "Expired";
    }

    return new Date(unixTime).toLocaleDateString(
        "en-US", {
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        }
    );
}