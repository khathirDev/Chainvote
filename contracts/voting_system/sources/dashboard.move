// #[allow(duplicate_alias)]
module Chainvote::dashboard {

    use sui::types;

    // To give meaningful names to the error codes, we can use the `const` keyword to define them.
    // This allows to use the error codes in a more readable way throughout the code.
    const EDuplicateProposal: u64 = 0;
    const EInvalidOtw: u64 = 1;

    // use sui::object::{Self, UID, ID};
    // use sui::tx_context::TxContext;
    // use sui::transfer;
    // use std::vector;

    public struct Dashboard has key {
        id: UID,
        proposals_ids: vector<ID>,
    }

     public struct AdminCap has key{
        id: UID,
        // admin: address,
    }

    //hot potato pattern
    // it cannot be stored, copied or discarded. it is a struct with no abilities.
    
    public struct DASHBOARD has drop{}

    fun init(otw: DASHBOARD, ctx: &mut TxContext) {
        let otw = otw;
        // check if the otw is a one time witness, if not, return an error
        new(otw, ctx);
    
        transfer::transfer(
            AdminCap {id: object::new(ctx)},
            ctx.sender(),
            );
    }
     public fun new(_otw: DASHBOARD, ctx: &mut TxContext) {
        let otw = _otw;
        assert!(types::is_one_time_witness(&otw), EInvalidOtw);
        // check if the otw is a one time witness, if not, return an error
        // this is to prevent the otw from being used in multiple transactions


        let dashboard = Dashboard {
            id: object::new(ctx),
            proposals_ids: vector::empty<ID>(),
        };
         

        transfer::share_object(dashboard);
    }


    public fun register_proposal(dashboard: &mut Dashboard, _admin_cap: &AdminCap, proposal_id: ID) {
       
        assert!(!vector::contains<ID>(&dashboard.proposals_ids, &proposal_id),
        EDuplicateProposal);
        // if the proposal id is already in the vector, it will not be added again, this is to prevent 
        // duplicate proposal ids in the vector
        
        vector::push_back(&mut dashboard.proposals_ids, proposal_id);
       
    }

    public fun proposals_ids(dashboard: &Dashboard): vector<ID> {
        dashboard.proposals_ids
    }

    #[test_only]
    public fun issue_admin_cap(ctx: &mut TxContext) {
        transfer::transfer(
            AdminCap {id: object::new(ctx)},
            ctx.sender(),
        );
        
    }


    #[test_only]
    public fun new_otw(_ctx: &mut TxContext): DASHBOARD {
       DASHBOARD {}
       
    }


    #[test]
    fun test_module_init(){

        use sui::test_scenario;

        // to import proposal module to create a proposal
        
        let creator = @0xCA;

        // to create a scenerio to simulate a transaction
        let mut scenario = test_scenario::begin(creator);
        {
            let otw = DASHBOARD {};
            init(otw, scenario.ctx());
        };

        scenario.next_tx(creator);
        {
            let dashboard = scenario.take_shared<Dashboard>();
            assert!(dashboard.proposals_ids.is_empty());
            test_scenario::return_shared(dashboard);
        };

        scenario.end();
        
    }



}

// only the owner of the capability can create an object from admin_cap, you can only create the object onnly from the
// module that defines the type.




