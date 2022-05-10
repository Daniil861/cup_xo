(() => {
    "use strict";
    function isWebp() {
        function testWebP(callback) {
            let webP = new Image;
            webP.onload = webP.onerror = function() {
                callback(2 == webP.height);
            };
            webP.src = "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
        }
        testWebP((function(support) {
            let className = true === support ? "webp" : "no-webp";
            document.documentElement.classList.add(className);
        }));
    }
    let addWindowScrollEvent = false;
    setTimeout((() => {
        if (addWindowScrollEvent) {
            let windowScroll = new Event("windowScroll");
            window.addEventListener("scroll", (function(e) {
                document.dispatchEvent(windowScroll);
            }));
        }
    }), 0);
    window.addEventListener("load", (function() {
        if (document.querySelector("body")) setTimeout((function() {
            document.querySelector("body").classList.add("_loaded");
        }), 200);
    }));
    if (sessionStorage.getItem("preloader")) {
        if (document.querySelector(".preloader")) document.querySelector(".preloader").classList.add("_hide");
        document.querySelector(".wrapper").classList.add("_visible");
    }
    if (sessionStorage.getItem("money")) {
        if (document.querySelector(".check")) document.querySelectorAll(".check").forEach((el => {
            el.textContent = sessionStorage.getItem("money");
        }));
    } else {
        sessionStorage.setItem("money", 1e4);
        if (document.querySelector(".check")) document.querySelectorAll(".check").forEach((el => {
            el.textContent = sessionStorage.getItem("money");
        }));
    }
    if (document.querySelector(".wrapper_game")) if (+sessionStorage.getItem("money") >= 100) {
        document.querySelector(".bet").textContent = 100;
        sessionStorage.setItem("current-bet", 100);
    } else {
        document.querySelector(".bet").textContent = 0;
        sessionStorage.setItem("current-bet", 0);
    }
    const preloader = document.querySelector(".preloader");
    const wrapper = document.querySelector(".wrapper");
    function delete_money(count, block) {
        let money = +sessionStorage.getItem("money");
        sessionStorage.setItem("money", money - count);
        setTimeout((() => {
            document.querySelectorAll(block).forEach((el => el.classList.add("_delete-money")));
            document.querySelectorAll(block).forEach((el => el.textContent = sessionStorage.getItem("money")));
        }), 500);
        setTimeout((() => {
            document.querySelectorAll(block).forEach((el => el.classList.remove("_delete-money")));
        }), 1500);
    }
    function no_money(block) {
        document.querySelectorAll(block).forEach((el => el.classList.add("_no-money")));
        setTimeout((() => {
            document.querySelectorAll(block).forEach((el => el.classList.remove("_no-money")));
        }), 1e3);
    }
    function get_random(min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    }
    function add_money(count, block, delay, delay_off) {
        setTimeout((() => {
            document.querySelectorAll(block).forEach((el => el.textContent = +sessionStorage.getItem("money") + count));
            document.querySelectorAll(block).forEach((el => el.classList.add("_anim-add-money")));
            sessionStorage.setItem("money", +sessionStorage.getItem("money") + count);
        }), delay);
        setTimeout((() => {
            document.querySelectorAll(block).forEach((el => el.classList.remove("_anim-add-money")));
        }), delay_off);
    }
    let anim_items = document.querySelectorAll(".item-score__icon img");
    function get_random_animate() {
        let number = get_random(0, 3);
        let arr = [ "jump", "scale", "rotate" ];
        let random_item = get_random(0, anim_items.length);
        anim_items.forEach((el => {
            if (el.classList.contains("_anim-icon-jump")) el.classList.remove("_anim-icon-jump"); else if (el.classList.contains("_anim-icon-scale")) el.classList.remove("_anim-icon-scale"); else if (el.classList.contains("_anim-icon-rotate")) el.classList.remove("_anim-icon-rotate");
        }));
        setTimeout((() => {
            anim_items[random_item].classList.add(`_anim-icon-${arr[number]}`);
        }), 100);
    }
    if (document.querySelector(".item-score__icon img")) setInterval((() => {
        get_random_animate();
    }), 1e4);
    if (document.querySelector(".main__body") && document.querySelector(".preloader").classList.contains("_hide")) document.querySelector(".main__body").classList.add("_active");
    const config_slot = {
        current_win: 0
    };
    if (document.querySelector(".slot__body") && document.querySelector(".preloader").classList.contains("_hide")) {
        document.querySelector(".slot__body").classList.add("_active");
        write_slot_current_win();
    }
    function write_slot_current_win() {
        if (config_slot.current_win > 0) document.querySelector(".win").textContent = `+${config_slot.current_win}`; else document.querySelector(".win").textContent = 0;
    }
    function write_count_win(bet) {
        config_slot.current_win += 100 * bet;
    }
    var casinoAutoSpin;
    class Slot {
        constructor(domElement, config = {}) {
            Symbol.preload();
            this.currentSymbols = [ [ "1", "2", "3" ], [ "2", "3", "4" ], [ "4", "3", "2" ], [ "3", "4", "5" ], [ "5", "2", "3" ] ];
            this.nextSymbols = [ [ "1", "2", "3" ], [ "2", "3", "4" ], [ "4", "3", "2" ], [ "3", "4", "5" ], [ "5", "2", "3" ] ];
            this.container = domElement;
            this.reels = Array.from(this.container.getElementsByClassName("reel")).map(((reelContainer, idx) => new Reel(reelContainer, idx, this.currentSymbols[idx])));
            this.betButton = document.querySelector(".buttons__bet");
            this.betButton.addEventListener("click", (() => {
                if (+sessionStorage.getItem("money") >= +sessionStorage.getItem("current-bet") + 100) {
                    document.querySelector(".bet").textContent = +document.querySelector(".bet").innerHTML + 100;
                    sessionStorage.setItem("current-bet", document.querySelector(".bet").innerHTML);
                } else no_money(".check");
            }));
            this.spinButton = document.querySelector(".buttons__spin");
            this.spinButton.addEventListener("click", (() => {
                if (+sessionStorage.getItem("money") >= +sessionStorage.getItem("current-bet")) this.spin(); else no_money(".check");
            }));
            this.casinoAutoSpinCount = 0;
            this.autoSpinButton = document.querySelector(".buttons__auto");
            this.autoSpinButton.addEventListener("click", (() => {
                var oThis = this;
                this.casinoAutoSpinCount = 0;
                if (+sessionStorage.getItem("money") > +sessionStorage.getItem("current-bet")) {
                    this.casinoAutoSpinCount++;
                    this.spin();
                }
                casinoAutoSpin = setInterval((function() {
                    oThis.casinoAutoSpinCount++;
                    if (oThis.casinoAutoSpinCount < 10 && +sessionStorage.getItem("money") >= +sessionStorage.getItem("current-bet")) oThis.spin(); else {
                        clearInterval(casinoAutoSpin);
                        no_money(".check");
                    }
                }), 5500);
            }));
            if (config.inverted) this.container.classList.add("inverted");
            this.config = config;
        }
        spin() {
            delete_money(+sessionStorage.getItem("current-bet"), ".check");
            this.currentSymbols = this.nextSymbols;
            this.nextSymbols = [ [ Symbol.random(), Symbol.random(), Symbol.random() ], [ Symbol.random(), Symbol.random(), Symbol.random() ], [ Symbol.random(), Symbol.random(), Symbol.random() ], [ Symbol.random(), Symbol.random(), Symbol.random() ], [ Symbol.random(), Symbol.random(), Symbol.random() ] ];
            this.onSpinStart(this.nextSymbols);
            return Promise.all(this.reels.map((reel => {
                reel.renderSymbols(this.nextSymbols[reel.idx]);
                return reel.spin();
            }))).then((() => this.onSpinEnd(this.nextSymbols)));
        }
        onSpinStart(symbols) {
            this.spinButton.classList.add("_hold");
            this.autoSpinButton.classList.add("_hold");
            this.betButton.classList.add("_hold");
            this.config.onSpinStart?.(symbols);
        }
        onSpinEnd(symbols) {
            this.spinButton.classList.remove("_hold");
            this.autoSpinButton.classList.remove("_hold");
            this.betButton.classList.remove("_hold");
            this.config.onSpinEnd?.(symbols);
        }
    }
    class Reel {
        constructor(reelContainer, idx, initialSymbols) {
            this.reelContainer = reelContainer;
            this.idx = idx;
            this.symbolContainer = document.createElement("div");
            this.symbolContainer.classList.add("icons");
            this.reelContainer.appendChild(this.symbolContainer);
            this.animation = this.symbolContainer.animate([ {
                transform: "none",
                filter: "blur(0)"
            }, {
                filter: "blur(2px)",
                offset: .5
            }, {
                transform: `translateY(-${10 * Math.floor(this.factor) / (3 + 10 * Math.floor(this.factor)) * 100}%)`,
                filter: "blur(0)"
            } ], {
                duration: 1e3 * this.factor,
                easing: "ease-in-out"
            });
            this.animation.cancel();
            initialSymbols.forEach((symbol => this.symbolContainer.appendChild(new Symbol(symbol).img)));
        }
        get factor() {
            return 1 + Math.pow(this.idx / 2, 2);
        }
        renderSymbols(nextSymbols) {
            const fragment = document.createDocumentFragment();
            for (let i = 3; i < 3 + 10 * Math.floor(this.factor); i++) {
                const icon = new Symbol(i >= 10 * Math.floor(this.factor) - 2 ? nextSymbols[i - 10 * Math.floor(this.factor)] : void 0);
                fragment.appendChild(icon.img);
            }
            this.symbolContainer.appendChild(fragment);
        }
        spin() {
            const animationPromise = new Promise((resolve => this.animation.onfinish = resolve));
            const timeoutPromise = new Promise((resolve => setTimeout(resolve, 1e3 * this.factor)));
            this.animation.play();
            return Promise.race([ animationPromise, timeoutPromise ]).then((() => {
                if ("finished" !== this.animation.playState) this.animation.finish();
                const max = this.symbolContainer.children.length - 3;
                for (let i = 0; i < max; i++) this.symbolContainer.firstChild.remove();
            }));
        }
    }
    const cache = {};
    class Symbol {
        constructor(name = Symbol.random()) {
            this.name = name;
            if (cache[name]) this.img = cache[name].cloneNode(); else {
                this.img = new Image;
                this.img.src = `img/game-1/slot-${name}.png`;
                if (document.querySelector(".wrapper_game-1")) this.img.src = `img/game-1/slot-${name}.png`; else if (document.querySelector(".wrapper_game-2")) this.img.src = `img/game-2/slot-${name}.png`; else if (document.querySelector(".wrapper_game-3")) this.img.src = `img/game-3/slot-${name}.png`;
                cache[name] = this.img;
            }
        }
        static preload() {
            Symbol.symbols.forEach((symbol => new Symbol(symbol)));
        }
        static get symbols() {
            return [ "1", "2", "3", "4", "5" ];
        }
        static random() {
            return this.symbols[Math.floor(Math.random() * this.symbols.length)];
        }
    }
    const config = {
        inverted: false,
        onSpinStart: symbols => {},
        onSpinEnd: symbols => {
            if (symbols[0][0] == symbols[1][0] && symbols[1][0] == symbols[2][0] && symbols[2][0] == symbols[3][0] && symbols[3][0] == symbols[4][0] || symbols[0][1] == symbols[1][1] && symbols[1][1] == symbols[2][1] && symbols[2][1] == symbols[3][1] && symbols[3][1] == symbols[4][1] || symbols[0][2] == symbols[1][2] && symbols[1][2] == symbols[2][2] && symbols[2][2] == symbols[3][2] && symbols[3][2] == symbols[4][2]) {
                write_count_win(300);
                write_slot_current_win();
                let currint_win = 100 * +sessionStorage.getItem("current-bet");
                add_money(currint_win, ".check", 1e3, 2e3);
            }
        }
    };
    if (document.querySelector(".wrapper_game")) {
        new Slot(document.getElementById("slot"), config);
    }
    document.addEventListener("click", (e => {
        let targetElement = e.target;
        if (targetElement.closest(".preloader__button")) {
            sessionStorage.setItem("preloader", true);
            preloader.classList.add("_hide");
            wrapper.classList.add("_visible");
            if (document.querySelector(".main__body") && document.querySelector(".preloader").classList.contains("_hide")) document.querySelector(".main__body").classList.add("_active");
        }
        if (targetElement.closest(".block-bet__minus")) {
            let current_bet = +sessionStorage.getItem("current-bet");
            if (current_bet >= 50) {
                sessionStorage.setItem("current-bet", current_bet - 50);
                document.querySelector(".block-bet__coins").textContent = sessionStorage.getItem("current-bet");
            }
        }
        if (targetElement.closest(".block-bet__plus")) {
            let current_bet = +sessionStorage.getItem("current-bet");
            let current_bank = +sessionStorage.getItem("money");
            if (current_bank - 49 > current_bet) {
                sessionStorage.setItem("current-bet", current_bet + 50);
                document.querySelector(".block-bet__coins").textContent = sessionStorage.getItem("current-bet");
            } else no_money(".check");
        }
    }));
    window["FLS"] = true;
    isWebp();
})();