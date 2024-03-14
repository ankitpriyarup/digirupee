NODE_NAME="icici2"
PORT=30311
AUTHRPC_PORT=8556
BOOTNODE=$(<nodes/bootnode)
ADDRESS="0xDFD9867b447A1Ba9f8B795222Ce5efA29ECA75D1"
 
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
