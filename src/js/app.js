App = {
    web3Provider: null,
    contracts: {},
    account: '0x0',
    loading: false,
    tokenPrice: 1000000000000000,
    tokensSold: 0,
    tokensAvailable: 750000,
    
  
    init: function() {
      console.log("App initialized...")
      return App.initWeb3();
    },
  
    initWeb3: function() {
      if (typeof web3 !== 'undefined') {
        // If a web3 instance is already provided by Meta Mask.
        App.web3Provider = web3.currentProvider;
        web3 = new Web3(web3.currentProvider);
      } else {
        // Specify default instance if no web3 instance provided
        App.web3Provider = new Web3.providers.HttpProvider('HTTP://172.23.240.1:7545');
        web3 = new Web3(App.web3Provider);
      }
      return App.initContracts();
    },
  
    initContracts: function() {
      $.getJSON("RandomTokenSale.json", function(randomTokenSale) {
        App.contracts.RandomTokenSale = TruffleContract(randomTokenSale);
        App.contracts.RandomTokenSale.setProvider(App.web3Provider);
        App.contracts.RandomTokenSale.deployed().then(function(randomTokenSale) {
          console.log("Random Token Sale Address:", randomTokenSale.address);
        });
      }).done(function() {
        $.getJSON("RandomToken.json", function(randomToken) {
          App.contracts.RandomToken = TruffleContract(randomToken);
          App.contracts.RandomToken.setProvider(App.web3Provider);
          App.contracts.RandomToken.deployed().then(function(randomToken) {
            console.log("Random Token Address:", randomToken.address);
          });
  
          App.listenForEvents();
          return App.render();
        });
      })
    },
    
  
    // Listen for events emitted from the contract
    listenForEvents: function() {
      App.contracts.RandomTokenSale.deployed().then(function(instance) {
        instance.Sell().on('data', function(event){
            console.log(event); // same results as the optional callback above
            App.render();
        })
        .on('changed', function(event){
            // remove event from local database
        })
        .on('error', console.error);
      })
    },
  
    render: function() {
      if (App.loading) {
        return;
      }
      App.loading = true;
  
      var loader  = $('#loader');
      var content = $('#content');
  
      loader.show();
      content.hide();
  
      // Load account data
      web3.eth.getCoinbase(function(err, account) {
        if(err === null) {
          App.account = account;
          $('#accountAddress').html("Your Account: " + account);
        }
      })
  
      // Load token sale contract
      App.contracts.RandomTokenSale.deployed().then(function(instance) {
        randomTokenSaleInstance = instance;
        return randomTokenSaleInstance.tokenPrice();
      }).then(function(tokenPrice) {
        App.tokenPrice = tokenPrice;
        $('.token-price').html(web3.utils.fromWei(App.tokenPrice, "ether"));
        return randomTokenSaleInstance.tokensSold();
      }).then(function(tokensSold) {
        App.tokensSold = tokensSold.toNumber();
        $('.tokens-sold').html(App.tokensSold);
        $('.tokens-available').html(App.tokensAvailable);
  
        var progressPercent = (Math.ceil(App.tokensSold) / App.tokensAvailable) * 100;
        $('#progress').css('width', progressPercent + '%');
  
        // Load token contract
        App.contracts.RandomToken.deployed().then(function(instance) {
            randomTokenInstance = instance;
          return randomTokenInstance.balanceOf(App.account);
        }).then(function(balance) {
          $('.rant-balance').html(balance.toNumber());
          App.loading = false;
          loader.hide();
          content.show();
        })
      });
    },
  
    buyTokens: function() {
      $('#content').hide();
      $('#loader').show();
      var numberOfTokens = $('#numberOfTokens').val();
      App.contracts.RandomTokenSale.deployed().then(function(instance) {
        return instance.buyTokens(numberOfTokens, {
          from: App.account,
          value: numberOfTokens * App.tokenPrice,
          gas: 500000 // Gas limit
        });
      }).then(function(result) {
        console.log("Tokens bought...")
        $('form').trigger('reset') // reset number of tokens in form
        // Wait for Sell event
      });
    }
  }
  
  $(function() {
    $(window).load(function() {
      App.init();
    })
  });