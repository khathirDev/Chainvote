import { useSuiClientQuery } from "@mysten/dapp-kit";
import { useNetworkVariable } from "../config/networkConfig";
import { PaginatedObjectsResponse, SuiObjectData } from "@mysten/sui/client";
import { ProposalItem } from "../components/proposal/ProposalItem";
import { useVoteNfts } from "../hooks/useVoteNfts";
import { VoteNft } from "../types";

const ProposalView = () => {
    const dasboardId = useNetworkVariable("dashboardId");
    const { data: voteNftsRes, refetch: refetchNfts } = useVoteNfts();

    const {data: dataResponse, isPending, error} = useSuiClientQuery("getObject", {
        id: dasboardId,
        options: {
            showContent: true,
        }
    });

    if(isPending) return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-400 mx-auto mb-4"></div>
                <p className="text-slate-300 text-lg font-medium">Loading proposals...</p>
            </div>
        </div>
    );

    if(error) return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <div className="text-center bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-2xl p-8 max-w-md mx-auto">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                </div>
                <h3 className="text-xl font-semibold text-red-400 mb-2">Error Loading Proposals</h3>
                <p className="text-red-300">{error.message}</p>
            </div>
        </div>
    );

    if(!dataResponse.data) return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <div className="text-center bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 max-w-md mx-auto">
                <div className="w-16 h-16 mx-auto mb-4 bg-slate-700/50 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-300 mb-2">No Data Found</h3>
                <p className="text-slate-400">Unable to load proposal data at this time.</p>
            </div>
        </div>
    );

    const voteNfts = extractVoteNfts(voteNftsRes);
    const proposalIds = getDashboardFields(dataResponse.data)?.proposals_ids || [];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="mb-12">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-2 h-12 bg-gradient-to-b from-blue-400 to-purple-500 rounded-full"></div>
                        <div>
                            <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-2">
                                New Proposals
                            </h1>
                            <p className="text-slate-400 text-lg">
                                {proposalIds.length} {proposalIds.length === 1 ? 'proposal' : 'proposals'} available for voting
                            </p>
                        </div>
                    </div>
                    
                    {/* Stats Bar */}
                    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                                    <span className="text-slate-300 font-medium">Live Voting</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                                    <span className="text-slate-300 font-medium">DAO Governance</span>
                                </div>
                            </div>
                            <div className="text-slate-400 text-sm">
                                ⚠️Chainvote doesn't support voting on testnet yet. This is a demo view.
                            </div>
                        </div>
                    </div>
                </div>

                {/* Proposals Grid */}
                {proposalIds.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                        {proposalIds.map((id, index) => (
                            <div
                                key={id}
                                className="transform hover:scale-105 transition-all duration-300"
                                style={{
                                    animationDelay: `${index * 100}ms`,
                                    animation: 'fadeInUp 0.6s ease-out forwards'
                                }}
                            >
                                <ProposalItem 
                                    onVoteTxSuccess={() => refetchNfts()}
                                    voteNft={voteNfts.find((nft) => nft.proposalId === id)} 
                                    id={id} 
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 rounded-3xl p-12 max-w-lg mx-auto">
                            <div className="w-20 h-20 mx-auto mb-6 bg-slate-700/30 rounded-full flex items-center justify-center">
                                <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-semibold text-slate-300 mb-3">No Proposals Yet</h3>
                            <p className="text-slate-400 text-lg leading-relaxed">
                                New governance proposals will appear here when they're submitted to the DAO.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Custom CSS for animations */}
            <style>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
};

function getDashboardFields(data: SuiObjectData){
    if(data.content?.dataType !== "moveObject") return null;
    
    return data.content.fields as {
        id: suiID,
        proposals_ids: string[]
    };
}

function extractVoteNfts(nftRes: PaginatedObjectsResponse | undefined) {
    if (!nftRes?.data) return [];

    return nftRes?.data.map(nftObject => getVotenft(nftObject.data));
}

function getVotenft(nftData: SuiObjectData | undefined | null) {
    if(nftData?.content?.dataType !== "moveObject") {
        return {id: {id:""}, url: "", proposalId: ""}
    }

    const { proposal_id: proposalId, url, id} = nftData.content.fields as any;

    return {
        proposalId,
        id,
        url
    } as VoteNft
}

export default ProposalView