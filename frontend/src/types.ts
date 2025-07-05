

export interface Proposal  {
  id: suiID,
  title: string, // originally vector<u8> (ASCII array)
  description: string, // originally vector<u8> (ASCII array)
  status: ProposalStatus;
  votedYesCount: number,
  votedNoCount: number,
  expiration: number,
  creator: string,
  voter_registry: string
  // any other fields...
};


export interface VoteNft {
  id: suiID;
  proposalId: string;
  url: string;
}

export type ProposalStatus = {
  variant: "Active" | "Delisted";
}