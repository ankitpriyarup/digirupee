NODE_NAME="sbi2"
PORT=30315
AUTHRPC_PORT=8560
BOOTNODE=$(<nodes/bootnode)
ADDRESS="0x0f45d0C215ea78A0D16b922a8184F2d3CE74c251"
 
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
