NODE_NAME="icici1"
PORT=30310
AUTHRPC_PORT=8555
BOOTNODE=$(<nodes/bootnode)
ADDRESS="0x61B895b657bb1e5A6B73aBE99Cb54E8F9599D8F3"
 
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
