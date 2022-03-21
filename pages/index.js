import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";
import { useState, useEffect } from "react";
import { managerAbi } from "../constants/manager_abi";
import { nft } from "../constants/nft_abi";
import { ethers } from "ethers";
import React from "react";

// import { pinataSDK } from "@pinata/sdk";

const injected = new InjectedConnector();

export default function Home() {
  // let json = {
  //   name: "",
  //   description: "",
  //   image: "",
  //   attributes: [{ trait_type: "cuteness", value: 100 }],
  // };

  const {
    active,
    activate,
    chainId,
    account,
    library: provider,
  } = useWeb3React();

  const [hasMetamask, setHasMetamask] = useState(false);
  const [showCollections, setShowCollections] = useState(false);
  const [collection_results, setCollectionAddress] = useState([]);
  const [createObjectURL, setCreateObjectURL] = useState(null);
  const manager_contract = "0xa7719E1147746C19E269db95D8b2Ed1EaD5D5c4d";

  const images = [
    "https://gateway.pinata.cloud/ipfs/QmUPjADFGEKmfohdTaNcWhp7VGk26h5jXDA7v3VtTnTLcW",
    "https://gateway.pinata.cloud/ipfs/QmYx6GsYAKnNzZ9A6NvEKV9nf1VaDzJrqDR23Y8YSkebLU",
    "https://gateway.pinata.cloud/ipfs/QmSsYRx3LpDAb1GZQm7zZ1AuHZjfbPkD6J7s9r41xu1mf8",
  ];

  const metadata = [
    "https://gateway.pinata.cloud/ipfs/QmStdakqGP9uzTu1SLkxKLcdVd3Hz8Xzm2NWfAJV2EfkDV",
    "https://gateway.pinata.cloud/ipfs/QmTXDxi7DjkRp3UerbWgKgi1n4aPLAmqL5zD1Wvtme2GQ8",
    "https://gateway.pinata.cloud/ipfs/QmQAfX4b6inV4mPrdjkV9Zf4QaQQJJ6k5V6jtLaZrims6T",
  ];

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      setHasMetamask(true);
    }
  });

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function connect() {
    if (typeof window.ethereum !== "undefined") {
      try {
        await activate(injected);
        setHasMetamask(true);
        getCollections();
      } catch (e) {
        console.log(e);
      }
    }
  }

  // async function pinJSON() {
  //   if (active) {
  //     const pinataSDK = require("@pinata/sdk");
  //     const pinata = pinataSDK("XXXXX", "XXXXXXXXX");
  //     // let img = await pinata.pinFileToIPFS(IndexPage());
  //     // console.log("image IPFS ", img);

  //     json.name = "NFT " + collection_results.length;
  //     json.description = "Your cute random poppy NFT";
  //     const rand = Math.random() * 2;
  //     console.log("rand: ", rand);
  //     setCreateObjectURL(images[1]);
  //     json.image = images[2];
  //     let metadata = await pinata.pinJSONToIPFS(json);
  //     console.log("JSON IPFS: ", metadata.IpfsHash);
  //   }
  // }

  async function getCollections() {
    console.log(active);
    if (active) {
      setCollectionAddress([]);
      const signer = provider.getSigner();
      console.log(signer.getAddress());
      const contract = new ethers.Contract(
        manager_contract,
        managerAbi,
        signer
      );
      let collection_address = await contract.callStatic.getCollections(
        signer.getAddress()
      );
      if (collection_address.length > 0) {
        for (var i = 0; i < collection_address.length; i++) {
          setCollectionAddress((collection_results) => [
            ...collection_results,
            collection_address[i],
          ]);
        }
        setShowCollections(true);
      } else {
        setShowCollections(false);
      }
      console.log("addresses: ", collection_address);
    } else {
      console.log("Not active");
    }
  }

  async function create_collection() {
    if (active) {
      const signer = provider.getSigner();
      console.log(signer.provider.network.name);
      console.log(ethers);
      const contract = new ethers.Contract(
        manager_contract,
        managerAbi,
        signer
      );
      const name = document.querySelector("#collection_name").value;
      const symbol = document.querySelector("#collection_symbol").value;
      if (name.length < 1 || symbol.length < 1) {
        alert("Name and symbol should not be empty");
      }
      try {
        let collection_address = await contract.createCollection(name, symbol);
        collection_address.wait(1);
        getCollections();
        alert("collection has been created!");
      } catch (error) {
        console.log(error);
      }
    } else {
      console.log("Please install MetaMask");
    }
  }

  async function addWhiteList() {
    const address = document.querySelector("#w_address").value;
    if (active && address.length > 0) {
      await getCollections();
      const signer = provider.getSigner();
      const manager = new ethers.Contract(manager_contract, managerAbi, signer);

      if (collection_results.length > 0) {
        await manager.addWhiteList(
          collection_results[collection_results.length - 1],
          address
        );
        alert("address " + address + " has beed white-listed!");
      } else {
        alert(
          "Please load collections list and make sure you have created a collection before whitelisting and try again!"
        );
      }
    } else {
      console.log("Please install MetaMask");
    }
  }
  async function mint_nft() {
    if (active && collection_results.length > 0) {
      const signer = provider.getSigner();
      // const manager = new ethers.Contract(manager_contract, managerAbi, signer);
      let collection = collection_results[collection_results.length - 1];
      const nft_contract = new ethers.Contract(collection, nft, signer);
      let tokenIds = await nft_contract.callStatic.getTokenIds();
      let tokenId = tokenIds.length;
      console.log(tokenId);

      try {
        await nft_contract.safeMint(signer.getAddress(), tokenId);
        alert("click update metadata in 20 seconds to update the NFT metadata");
      } catch (error) {
        console.log(error);
      }
    } else {
      alert("wallet is not connected or you havent created any collection");
    }
  }

  async function updateMetadata() {
    if (active && collection_results.length > 0) {
      const signer = provider.getSigner();
      let collection = collection_results[collection_results.length - 1];
      const nft_contract = new ethers.Contract(collection, nft, signer);
      let tokenIds = await nft_contract.callStatic.getTokenIds();
      let tokenId = tokenIds[tokenIds.length - 1];
      const rand = Math.ceil(Math.random() * 10) % 3;
      console.log(metadata[rand]);
      try {
        await nft_contract.setTokenURI(tokenId, metadata[rand]);
        const link =
          "https://testnets.opensea.io/assets/" +
          nft_contract.address +
          "/" +
          tokenId;
        console.log(link);
        alert(
          "link to the NFT is: " +
            link +
            "    wait 20 seconds for the transaction to propogate"
        );
      } catch (error) {
        console.log(error);
      }
    }
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Snapp innovations test task</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <h3 className={styles.title}>
          Welcome to Snap NFT limited Token Transfer
        </h3>

        <p className={styles.description}>
          how it works:
          <br /> * Craate a Collection using{" "}
          <code className={styles.code}>create a collection</code> button
          <br /> * Adding an item to the collection using{" "}
          <code className={styles.code}>add Item</code> button
          <br /> * Add a white list address using{" "}
          <code className={styles.code}>white list an address</code> button
          <br />
          this way you can transfer the item to that address (setting that
          address as internal address)
          <br /> * before adding an address as a white list you can try to
          transfer the NFT item <br />
          to check whether it would be transfered or not <br />
          **** USE RINKEBY TESTNET****
          <br /> this way you can interact with the NFT using opensea testnet
          (Which works only on rinkeby testnet)
        </p>

        <div className={styles.grid}>
          <div className={styles.card}>
            <h2>Connect Wallet</h2>
            <p>
              {hasMetamask ? (
                active ? (
                  "Connected! "
                ) : (
                  <button onClick={() => connect()}>Connect</button>
                )
              ) : (
                "Please install metamask"
              )}
            </p>
          </div>
          <div className={styles.card}>
            <h2>Create Collection</h2>
            {active ? (
              <div>
                <p>
                  <label>Collection Name</label>
                  <input type="text" id="collection_name" />
                </p>
                <p>
                  <label>Collection Symbol</label>
                  <input type="text" id="collection_symbol" />
                </p>
                <p>
                  <button onClick={() => create_collection()}>
                    Create a Collection
                  </button>
                </p>
              </div>
            ) : (
              " Not connected!"
            )}
          </div>

          <div className={styles.card}>
            <h2>MINT NFT</h2>
            {active ? (
              <div>
                <p>
                  to make it simpler i have already uploaded some images into
                  IPFS, one of them randomly
                  <br /> will be minted and you can see the link of the token on
                  opensea
                  <br /> with your address as the owner.
                </p>
                <p>
                  <button onClick={() => mint_nft()}>Mint an NFT</button>
                </p>
                <p>
                  <button onClick={() => updateMetadata()}>
                    update the last NFT metadata
                  </button>
                </p>
              </div>
            ) : (
              " Not connected!"
            )}
          </div>
          <div>
            <h2>Show collections addresses</h2>
            {active ? (
              <div>
                <button onClick={() => getCollections()}>
                  Load created collections
                </button>
                <div>
                  {showCollections ? (
                    <div>
                      {
                        <ol>
                          {collection_results.map((add) => (
                            <li key={add.id}>
                              <a
                                href={
                                  "https://rinkeby.etherscan.io/address/" + add
                                }
                              >
                                {add}
                              </a>
                              <br />
                            </li>
                          ))}
                        </ol>
                      }
                    </div>
                  ) : (
                    <div>
                      click to load already created collections through your
                      account
                    </div>
                  )}
                </div>
              </div>
            ) : (
              "Not connected!"
            )}
          </div>
          <div className={styles.card}>
            <h2>White-List an address</h2>
            {active ? (
              <div>
                <p>
                  <label>Address</label>
                  <input type="text" id="w_address" />
                </p>
                <button onClick={() => addWhiteList()}>add address</button>
              </div>
            ) : (
              "Not connected!"
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
