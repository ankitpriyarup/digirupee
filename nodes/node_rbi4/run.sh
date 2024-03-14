NODE_NAME="rbi4"
PORT=30309
AUTHRPC_PORT=8554
BOOTNODE=$(<nodes/bootnode)
ADDRESS="0x39E368c85A6B0d992b3Aa1CA09A033C165479C87"
 
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
