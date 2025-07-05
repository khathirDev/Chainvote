#!/bin/bash

# Proposal data
declare -a names=("Proposal3" "Proposal4" "Proposal5")
declare -a descs=("Description for Proposal 3" "Description for Proposal 4" "Description for Proposal 5")
declare -a times=(1768825692 1768825692 1768825692)

# Move module info
PACKAGE_ID="0x57643b3f46917172c5cf9cec8db4b9332e3f57bb4085ac38b5c362a0e7504e4c"
MODULE_NAME="dashboard"
FUNCTION_NAME="create_proposal"
GAS_BUDGET=100000000
# RPC_URL="https://fullnode.testnet.sui.io:443"

# Loop through and call the function
for i in "${!names[@]}"; do
  echo "📨 Creating proposal: ${names[$i]}"

  sui client call \
    --package $PACKAGE_ID \
    --module $MODULE_NAME \
    --function $FUNCTION_NAME \
    --args "${names[$i]}" "${descs[$i]}" "${times[$i]}" \
    --gas-budget $GAS_BUDGET \
    # --rpc $RPC_URL

  if [ $? -eq 0 ]; then
    echo "✅ Proposal '${names[$i]}' created successfully"
  else
    echo "❌ Failed to create proposal '${names[$i]}'"
  fi

  echo "--------------------------------------------"
done
