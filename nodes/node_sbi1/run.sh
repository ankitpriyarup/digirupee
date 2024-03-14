NODE_NAME="sbi1"
PORT=30314
AUTHRPC_PORT=8559
BOOTNODE=$(<nodes/bootnode)
ADDRESS="0x6BdD19AA9A5f3e909437803A527f4736260EDdBc"
 
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
