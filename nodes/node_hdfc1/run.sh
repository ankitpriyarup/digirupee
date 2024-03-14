NODE_NAME="hdfc1"
PORT=30312
AUTHRPC_PORT=8557
BOOTNODE=$(<nodes/bootnode)
ADDRESS="0x98a8a77b3273655D749795B0c2A35E99d59d6B29"
 
echo $BOOTNODE
geth \
    --datadir ./nodes/node_$NODE_NAME \
    --port $PORT \
    --bootnodes $BOOTNODE \
    --networkid 123454321 \
    --unlock $ADDRESS \
    --password nodes/password \
    --authrpc.port $AUTHRPC_PORT \
    --mine \
    --miner.etherbase $ADDRESS \
    --ipcdisable \
    --verbosity "1" \
    console
