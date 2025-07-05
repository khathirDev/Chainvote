// Description: This module defines the Proposal struct and its associated functions for creating and managing proposals 
//in the voting system.
// #[allow(duplicate_alias)]
module Chainvote::proposal {

    // use sui::object::UID;
    use std::string::String;
    use sui::url::{Url, new_unsafe_from_bytes};
    use sui::table::{Self, Table};
    use sui::tx_context::sender;
    use sui::clock::{Clock};
    use sui::event;
    use Chainvote::dashboard::AdminCap;



    // === Error codes ===
    // Error codes are used to identify specific errors that may occur during the execution of the code.
    const EDuplicateVote: u64 = 0;
    const EProposalDelisted: u64 = 1;
    const EProposalExpired: u64 = 2;

    public enum ProposalStatus has store, drop, copy {
        // marking it as copy means that the enum can be copied
        // marking it as drop means that the old value would be destroyed for a new one to be set (from active to delisted)
        // marking it as 'has store' means that the enum can be stored in a table
        Active,
        Delisted,
        // enum is a type that can have one of several values
        // if you want to store other structs or enums in any other struct, you need to mark it as 'has store'
       
    }

   
    public struct Proposal has key {
        id: UID,
        title: String,
        description: String,
        voted_yes_count: u64,
        voted_no_count: u64,
        expiration: u64,
        status: ProposalStatus,
        creator: address,
        voters: Table<address, bool>,
    }


    public struct VoteProofNFT has key {
        // marking it as 'has key' means that the object is unique and can be used as a key in a table
        id: UID,
        proposal_id: ID,
        name: String,
        description: String,
        url: Url,
    }

    public struct VoteRegistered has copy, drop{
        proposal_id: ID,
        voter: address,
        vote_yes: bool,
    }

    // === Public Functions ===

    public fun vote(self: &mut Proposal, vote_yes: bool, clock: &Clock, ctx: &mut TxContext) {
        assert!(self.expiration > clock.timestamp_ms(), EProposalExpired);
        assert!(self.is_active(), EProposalDelisted);
        assert!(!self.voters.contains(ctx.sender()), EDuplicateVote);

        if (vote_yes) {
            self.voted_yes_count = self.voted_yes_count + 1;
        } else {
            self.voted_no_count = self.voted_no_count + 1;
        };

        self.voters.add(ctx.sender(), vote_yes);
        issue_vote_NFT(self, vote_yes, ctx);

        event::emit(VoteRegistered {
                proposal_id: self.id.to_inner(),
                voter: ctx.sender(),
                vote_yes
        });

        // events is the way to get information off chain, information sent through events can be retrieved whether in
        // the backend, frontend or any server of such

    }

    // basically in sui, all objects are NFTs, cos they are all unique only that they are not fungible


    // === View Functions ===

    // getter function to allow us access the proposal fields in other modules
    
    public fun vote_proof_url(proposal: &VoteProofNFT): Url {
        proposal.url
    }

    public fun is_active(self: &Proposal): bool {
        let status  = self.status();
        // match is used for pattern matching
        match (status) {
            ProposalStatus::Active => true,
            _ => false,
        }
    }

    public fun status(self: &Proposal): ProposalStatus {
        self.status
    }

    public fun title(proposal: &Proposal): String {
        proposal.title
    }

    public fun description(self: &Proposal): String {
        self.description
    }

    public fun voted_yes_count(self: &Proposal): u64 {
        self.voted_yes_count
    }

    public fun voted_no_count(self: &Proposal): u64 {
        self.voted_no_count
    }

    public fun expiration(self: &Proposal): u64 {
        self.expiration
    }

    public fun creator(self: &Proposal): address {
        self.creator
    }

    public fun voters(self: &Proposal): &Table<address, bool> {
        &self.voters
        
    }
   


    // === Admin Functions ===

    public fun create(
        _admin_cap: &AdminCap,
        title: String,
        description: String,
        expiration: u64,
        ctx: &mut TxContext
    ): ID {
        let id = object::new(ctx);
        let creator = tx_context::sender(ctx);

        let proposal = Proposal {
            id,
            title,
            description,
            voted_yes_count: 0,
            voted_no_count: 0,
            expiration,
            creator,
            status: ProposalStatus::Active,
            voters: table::new(ctx),
        };

        let id = proposal.id.to_inner();
        transfer::share_object(proposal);

        id
        
    }

    public fun remove(self: Proposal, _admin_cap: &AdminCap) {
        let Proposal {
            id,
            title: _,
            description: _,
            voted_yes_count: _,
            voted_no_count: _,
            expiration: _,
            status: _,
            creator: _,
            voters,
        } = self;

            table::drop(voters);
            object::delete(id);
    }


    public fun set_active_status(self: &mut Proposal, _admin_cap: &AdminCap) {
        self.change_status(_admin_cap, ProposalStatus::Active);
    }

    
    public fun set_delisted_status(self: &mut Proposal, _admin_cap: &AdminCap) {
        self.change_status(_admin_cap, ProposalStatus::Delisted);
    }

    
    fun change_status(self: &mut Proposal, _admin_cap: &AdminCap, status: ProposalStatus) {
        self.status = status;

    }


    fun issue_vote_NFT(proposal: &Proposal, vote_yes: bool, ctx: &mut TxContext) {
        let mut name = b"NFT".to_string();
        name.append(proposal.title);

        let mut description = b"Proof of voting on".to_string();
        let proposal_address = object::id_address(proposal).to_string();
        description.append(proposal_address);

        let vote_yes_image = new_unsafe_from_bytes(b"https://khathir.sirv.com/vote_yes_nft.jpeg");
        let vote_no_image = new_unsafe_from_bytes(b"https://khathir.sirv.com/vote_no_nft.jpeg");

        let url = if (vote_yes) {
            vote_yes_image
        } else {
            vote_no_image
        };

        let proof = VoteProofNFT{
            id: object::new(ctx),
            proposal_id: proposal.id.to_inner(),
            name,
            description,
            url,
        };

        transfer::transfer(proof, ctx.sender());

    }

    // helper functions to help do somethings we cant do outside of this module because proposalstatus isn't available outside of this module
    
    

    
    

}
