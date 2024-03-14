NODE_NAME="hdfc2"
PORT=30313
AUTHRPC_PORT=8558
BOOTNODE=$(<nodes/bootnode)
ADDRESS="0xa79aDa0d5aAa27efB02915191350ed86a9DD8c05"
 
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
