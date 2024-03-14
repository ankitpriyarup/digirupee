NODE_NAME="rbi2"
PORT=30307
AUTHRPC_PORT=8552
BOOTNODE=$(<nodes/bootnode)
ADDRESS="0xae5661a846E4562FE12c347Cb34d84FBDC2CF048"
 
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
