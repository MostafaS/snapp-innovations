module.exports = {
  abi: [
    {
      inputs: [
        {
          internalType: "address",
          name: "_collection",
          type: "address",
        },
        {
          internalType: "address",
          name: "_user",
          type: "address",
        },
      ],
      name: "addAddress",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_collection",
          type: "address",
        },
        {
          internalType: "address",
          name: "_user",
          type: "address",
        },
      ],
      name: "isWhiteList",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      name: "white_list",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
  ],
};
