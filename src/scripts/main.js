import Game from "./game";


// DOM elements
let signupMenu = document.getElementById('signupMenu');
let signUpButton = document.getElementById('signupButton');
let signinLink = document.getElementById('signinLink');

let signinMenu = document.getElementById('signinMenu');
let signinButton = document.getElementById('signinButton');
let signupLink = document.getElementById('signupLink');

let menu = document.getElementById('menu');
let mainMenu = document.getElementById('mainMenu');
let playButton = document.getElementById('playButton');
let leaderboardButton = document.getElementById('leaderboardButton');
let shopButton = document.getElementById('shopButton');
let signOutButton = document.getElementById('signOutButton');

let leaderboardMenu = document.getElementById('leaderboardMenu');
let shopMenu = document.getElementById('shopMenu');
let leaderboardBackButton = document.getElementById('leaderboardBackButton');
let shopBackButton = document.getElementById('shopBackButton');


// Event listeners
signinLink.addEventListener('click', function () {
    // Hide signup, show signin
    signupMenu.style.display = 'none';
    signinMenu.style.display = 'flex';
    mainMenu.style.display = 'none';
});

signupLink.addEventListener('click', function () {
    // Show signup, hide signin
    signupMenu.style.display = 'flex';
    signinMenu.style.display = 'none';
    mainMenu.style.display = 'none';
});


signinButton.addEventListener('click', function () {
    // Get email and password & sign in
    let email = document.getElementById('signinEmail').value;
    let password = document.getElementById('signinPassword').value;
    SignIn(email, password);
});

signUpButton.addEventListener('click', function () {
    // Get email, password, confirm password and username & sign up
    let email = document.getElementById('signupEmail').value;
    let password = document.getElementById('signupPassword').value;
    let cPassword = document.getElementById('signupConfirmPassword').value;
    let username = document.getElementById('signupUsername').value;
    SignUp(email, password, cPassword, username);
});

playButton.addEventListener('click', function () {
    // Hide menu and start game
    menu.style.display = 'none';
    mainMenu.style.display = 'none';
    Game(GameFuseUser.CurrentUser.getAttributeValue("Bird"));
});

leaderboardButton.addEventListener('click', function () {
    // Hide menu and show leaderboard
    mainMenu.style.display = 'none';
    leaderboardMenu.style.display = 'flex';

    GameFuse.Instance.getLeaderboard(5, false, "GameLeaderboard", function (message, hasError) {
        if (hasError) {
            console.log("Error getting leaderboard: " + message);
        }
        else {
            console.log("Leaderboard got successfully");
            updateLeaderboard();
        }
    });

    updateLeaderboard();
});

function updateLeaderboard() {
    // Update leaderboard UI with entries from GameFuse
    let leaderboardList = document.getElementById("leaderboardList");
    leaderboardList.innerHTML = '';
    const enteries = GameFuse.Instance.leaderboardEntries;
    if (enteries.length === 0) {
        leaderboardList.innerHTML += `
        <div class="leaderboardItem">
            <p class="leaderboardItemRank">-</p>
            <p class="leaderboardItemUsername">-</p>
            <p class="leaderboardItemScore">-</p>
        </div>
        `;
    }
    for (let i = 0; i < enteries.length; i++) {
        leaderboardList.innerHTML += `
        <div class="leaderboardItem">
            <p class="leaderboardItemRank">${i + 1}</p>
            <p class="leaderboardItemUsername">${enteries[i].username}</p>
            <p class="leaderboardItemScore">${enteries[i].score}</p>
        </div>
        `;
    }
}


shopButton.addEventListener('click', function () {
    // Hide menu and show shop
    mainMenu.style.display = 'none';
    shopMenu.style.display = 'flex';

    updateShop();
});

// Purchase store item with id of storeItem using Credits of User
function purchaseStoreItem(storeItemId) {
    console.log("Purchasing store item: " + storeItemId);

    let storeItems = GameFuse.getStoreItems();
    let storeItem = null;
    let isFound = false;
    for (let i = 0; i < storeItems.length; i++) {
        if (storeItems[i].id === storeItemId) {
            storeItem = storeItems[i];
            isFound = true;
            break;
        }
    }
    if (!isFound) {
        console.log("Store item not found");
        return;
    }

    GameFuseUser.CurrentUser.purchaseStoreItem(storeItem, function (message, hasError) {
        if (hasError) {
            console.log("Error purchasing store item: " + message);
        }
        else {
            console.log("Store item purchased successfully");
            updateShop();
        }
    });
}

// Select bird item with value of value
function selectBirdItem(value) {
    console.log("Selecting bird item: " + value);

    GameFuseUser.CurrentUser.setAttribute("Bird", value, function (message, hasError) {
        if (hasError) {
            console.log("Error setting attribute: " + message);
        }
        else {
            console.log("Attribute set successfully");
            updateShop();
        }
    });
}

// Update shop UI with store items from GameFuse
function updateShop() {
    document.getElementById("shopCredits").innerText = GameFuseUser.CurrentUser.getCredits();

    let storeItems = GameFuse.getStoreItems();
    for (let i = 0; i < storeItems.length; i++) {
        storeItems[i].isPurchased = false
    }
    let purchasedItems = GameFuseUser.CurrentUser.getPurchasedStoreItems();
    for (let i = 0; i < purchasedItems.length; i++) {
        let purchasedItemId = purchasedItems[i].id;
        for (let j = 0; j < storeItems.length; j++) {
            if (storeItems[j].id === purchasedItemId) {
                storeItems[j].isPurchased = true;
                break;
            }
        }
    }

    // General function to get image url of bird
    const getImageUrl = (name) => {
        switch (name) {
            case "Red FlappyBird":
                return "/sprites/redbird-downflap.png";
            case "Blue FlappyBird":
                return "/sprites/bluebird-downflap.png";
            case "Yellow FlappyBird":
                return "/sprites/yellowbird-downflap.png";
            default:
                ""
        }
    }

    // Update shop store items UI
    let shopList = document.getElementById("shopList");
    shopList.innerHTML = '';
    for (let i = 0; i < storeItems.length; i++) {
        shopList.innerHTML += `
        <div class="shopItem">
            <img src="${getImageUrl(storeItems[i].name)}" alt="bird" />
            <p class="shopItemName">${storeItems[i].name}</p>
            <p class="shopItemPrice">${storeItems[i].cost} Credits</p>
            <button id="shopButton${i}" class="shopItemBuyButton" ${storeItems[i].isPurchased ? 'disabled' : ''}>
                ${storeItems[i].isPurchased ? "Purchased" : "Buy"}
            </button>
        </div>
        `;
    }
    // Add event listeners to shop store items UI
    for (let i = 0; i < storeItems.length; i++) {
        let shopButton = document.getElementById(`shopButton${i}`);
        if (shopButton !== null) {
            shopButton.addEventListener('click', function () {
                purchaseStoreItem(storeItems[i].id);
            });
        }
    }

    // Update shop birds UI
    let birdsList = document.getElementById("birdsList");
    birdsList.innerHTML = '';
    let selectedBird = GameFuseUser.CurrentUser.getAttributeValue("Bird");
    birdsList.innerHTML += `
    <div id="birdItem0" class="birdItem${selectedBird === 'blue' ? ' birdItemActive' : ''}">
        <img src="${getImageUrl("Blue FlappyBird")}" alt="bird" />
        <span class="birdName">Blue FlappyBird</span>
    </div>
    `
    for (let i = 0; i < storeItems.length; i++) {
        if (storeItems[i].isPurchased) {
            let birdValue = storeItems[i].name.toString().split(' ')[0].toString().toLowerCase();

            birdsList.innerHTML += `
            <div id="birdItem${i + 1}" class="birdItem${selectedBird === (birdValue) ? ' birdItemActive' : ''}">
                <img src="${getImageUrl(storeItems[i].name)}" alt="bird" />
                <span class="birdName">${storeItems[i].name}</span>
            </div>
            `
        }
    }

    // Add event listeners to shop birds UI
    let birdItem0 = document.getElementById(`birdItem0`);
    if (birdItem0 !== null) {
        birdItem0.addEventListener('click', function () {
            selectBirdItem("blue");
        });
    }
    for (let i = 0; i < storeItems.length; i++) {
        if (storeItems[i].isPurchased) {
            let birdValue = storeItems[i].name.toString().split(' ')[0].toString().toLowerCase();
            let birdItem = document.getElementById(`birdItem${i + 1}`);
            if (birdItem !== null) {
                birdItem.addEventListener('click', function () {
                    selectBirdItem(birdValue);
                });
            }
        }
    }

}

signOutButton.addEventListener('click', function () {
    // Sign out and show signin
    mainMenu.style.display = 'none';
    signinMenu.style.display = 'flex';
});

leaderboardBackButton.addEventListener('click', function () {
    // Hide leaderboard and show menu
    leaderboardMenu.style.display = 'none';
    mainMenu.style.display = 'flex';
});

shopBackButton.addEventListener('click', function () {
    // Hide shop and show menu
    shopMenu.style.display = 'none';
    mainMenu.style.display = 'flex';
});


window.onload = function () {
    start();
}

function start() {
    // Initialize GameFuse
    var gameID = '10';
    var gameToken = '8ed1ab47-d161-4008-9f07-97d2d60bbea4';

    GameFuse.setUpGame(gameID, gameToken, function (message, hasError) {
        if (hasError) {
            console.log("Error connecting game: " + message);
        }
        else {
            console.log("Game Connected Successfully")
        }

    }, { seedStore: "seedStore" });
}

// Sign in with email and password
const SignIn = (email, password) => {
    signinButton.disabled = true;

    GameFuse.signIn(email, password, function (message, hasError) {
        if (hasError) {
            alert("Error! Please check your email and password.");
            console.log("Error signing in: " + message);
            signinButton.disabled = false;
        }
        else {
            console.log("Signed in: " + GameFuseUser.CurrentUser.getUsername());
            signinButton.disabled = false;
            signinMenu.style.display = 'none';
            mainMenu.style.display = 'flex';

            // Initialize user attributes
            let credits = GameFuseUser.CurrentUser.getCredits();
            if (credits === 0) {
                GameFuseUser.CurrentUser.addCredits(100, function (message, hasError) {
                    if (hasError) {
                        console.log("Error adding credits: " + message);
                    }
                    else {
                        console.log("Credits added successfully");
                    }
                });
            }

            let isPassed100Points = GameFuseUser.CurrentUser.getAttributeValue("IsPassed100Points");
            if (isPassed100Points === null || isPassed100Points === undefined || isPassed100Points === '') {
                GameFuseUser.CurrentUser.setAttribute("IsPassed100Points", "false", function (message, hasError) {
                    if (hasError) {
                        console.log("Error setting attribute: " + message);
                    }
                    else {
                        console.log("Attribute set successfully");
                    }
                });
            }
            let isPassed200Points = GameFuseUser.CurrentUser.getAttributeValue("IsPassed200Points");
            if (isPassed200Points === null || isPassed200Points === undefined || isPassed200Points === '') {
                GameFuseUser.CurrentUser.setAttribute("IsPassed200Points", "false", function (message, hasError) {
                    if (hasError) {
                        console.log("Error setting attribute: " + message);
                    }
                    else {
                        console.log("Attribute set successfully");
                    }
                });
            }
            let score = GameFuseUser.CurrentUser.getAttributeValue("Score");
            if (score === null || score === undefined || score === '') {
                GameFuseUser.CurrentUser.setAttribute("Score", "0", function (message, hasError) {
                    if (hasError) {
                        console.log("Error setting attribute: " + message);
                    }
                    else {
                        console.log("Attribute set successfully");
                    }
                });
            }
            let bird = GameFuseUser.CurrentUser.getAttributeValue("Bird");
            if (bird === null || bird === undefined || bird === '') {
                GameFuseUser.CurrentUser.setAttribute("Bird", "blue", function (message, hasError) {
                    if (hasError) {
                        console.log("Error setting attribute: " + message);
                    }
                    else {
                        console.log("Attribute set successfully");
                    }
                });
            }


            GameFuse.Instance.getLeaderboard(5, false, "GameLeaderboard", function (message, hasError) {
                if (hasError) {
                    console.log("Error getting leaderboard: " + message);
                }
                else {
                    console.log("Leaderboard got successfully");
                }
            });
        }
    });
}

// Sign up with email, password, confirm password and username
const SignUp = (email, password, cPassword, username) => {
    signUpButton.disabled = true;

    GameFuse.signUp(email, password, cPassword, username, function (message, hasError) {
        if (hasError) {
            alert("Error! Please check your email, password, confirm Password and Username.");
            console.log("Error signing up: " + message);
            signUpButton.disabled = false;
            document.getElementById("signupPassword").value = "";
            document.getElementById("signupConfirmPassword").value = "";
        }
        else {
            console.log("Signed up: " + GameFuseUser.CurrentUser.getUsername());
            signUpButton.disabled = false;
            signupMenu.style.display = 'none';
            signinMenu.style.display = 'flex';
        }
    });
}