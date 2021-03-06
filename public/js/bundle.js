(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

let AutoCrafter = require('./src/autocrafter.js');
let Recipes = require('./src/recipes.js');

let upgrades = {
  'crafting': 1,
  'smelting': 1
}

let items = {
  'assembling machine 1': 'Assembling-machine-1.png',
  'assembling machine 2': 'Assembling-machine-2.png',
  'assembling machine 3': 'Assembling-machine-3.png',
  'transport belt': 'Basic-transport-belt.png',
  'copper cable': 'Copper-cable.png',
  'copper plate': 'Copper-plate.png',
  'electronic circuit': 'Electronic-circuit.png',
  'inserter': 'Inserter-icon.png',
  'iron gear wheel': 'Iron-gear-wheel.png',
  'iron plate': 'Iron-plate.png',
  'science pack 2': 'Science-pack-2.png',
  'science pack 1': 'Science-pack-1.png',
  'steel furnace': 'Steel-furnace.png',
  'stone furnace': 'Stone-furnace.png',
  'electric furnace': 'Electric-furnace.png',
  'stone': 'Stone.png',
  'stone brick': 'Stone-brick.png',
  'steel plate': 'Steel-plate.png'
};

AutoCrafter.setup(upgrades);

let FactoryForm = {
  item: items[0],
  form: document.getElementById('factoryFormForm'),
  resultsList: document.getElementById('results'),
  setItem: function(item){
    this.item = item;
    this.updateIcon();
  },
  updateIcon: function(){
    let recipeSpan = document.getElementById("recipeSpan");
    while(recipeSpan.firstChild)
      recipeSpan.removeChild(recipeSpan.firstChild);

    let recipe = Recipes.find(function(recipe){
      return (this.item in recipe.result);
    }.bind(this));
    if (recipe){
      let newIcon = function(item){
        let icon = document.createElement("img");
        icon.src = "./images/" + items[item];
        return icon;
      }
      for (let requirement in recipe.requirements){
        if(requirement in items)
          recipeSpan.appendChild(newIcon(requirement));
      }

      { 
        let seperator = document.createElement("span");
        var el = document.createElement("div");
        el.innerHTML = "&#8594;";
        seperator.textContent = el.firstChild.data;
        recipeSpan.appendChild(seperator);
      }

      for (let result in recipe.result){
        if(result in items)
          recipeSpan.appendChild(newIcon(result));
      }
    }
  },
  submit: function(data){
    let smeltingSpeed = parseFloat(Array.prototype.slice.call(document.getElementsByName("smelting")).find(function(input){ return input.checked }).value);
    let craftingSpeed = parseFloat(Array.prototype.slice.call(document.getElementsByName("crafting")).find(function(input){ return input.checked }).value);

    let upgrades = {
      'smelting': smeltingSpeed,
      'crafting': craftingSpeed
    };
    AutoCrafter.setup(upgrades);

    let quantity = parseFloat(document.getElementById('quantity').value);
    console.log('calculate ', this.item, ' for ', quantity);
    let result = AutoCrafter.craft(this.item, quantity);
    this.parseResults(result);
  },
  clearResults: function(){
    while(this.resultsList.firstChild)
      this.resultsList.removeChild(this.resultsList.firstChild);
  },
  parseResults: function(result){
    this.clearResults();
    for(let item in result){
      let li = document.createElement("li");
      let img = document.createElement("img");
      let span = document.createElement("span");
      span.innerHTML = result[item];
      img.src = "images/" + items[item];
      li.appendChild(img);
      li.appendChild(span);
      this.resultsList.appendChild(li);
    }
  }
};

let recipeContainer = document.getElementById("recipes");
for(let item in items){
  let url = items[item];
  let btn = document.createElement("button");
  let img = document.createElement("img");
  img.src = "images/" + url;
  btn.appendChild(img);
  btn.addEventListener('click', function(){
    FactoryForm.setItem(item)
  }, false);
  recipeContainer.appendChild(btn);
}

FactoryForm.setItem('transport belt');
FactoryForm.submit();

FactoryForm.form.onsubmit = function(data){
  FactoryForm.submit(data);
  return false;
}

},{"./src/autocrafter.js":2,"./src/recipes.js":3}],2:[function(require,module,exports){
let AutoCrafter = {
  recipes: require('./recipes.js'),
  upgrades: { 'crafting': 1, 'smelting': 2},
  setup: function(upgrades){
    this.upgrades = upgrades;
  },

  craft: function(itemName, quantity, results){
    if (results == undefined) results = {};
    let recipe = this.recipes.find(function(recipe){
      return (itemName in recipe.result);
    });
    if (!recipe){
      console.log("Recipe unknown for ", itemName);
    } else {

      let itemQuantity = quantity / recipe.result[itemName] * recipe.time / this.upgrades[recipe.method];
      for(let requirement in recipe.requirements){
        this.craft(requirement, recipe.requirements[requirement] * itemQuantity, results);
      }
      let key = Object.keys(recipe.result).join();
      if (!(key in results)) results[key] = 0;
      results[key] += itemQuantity;
    }

    return results;
  }
}

module.exports = AutoCrafter;

},{"./recipes.js":3}],3:[function(require,module,exports){
module.exports = [
  {
    result: { 'copper plate': 1 },
    requirements: { 'copper ore': 1 },
    time: 3.5,
    method: 'smelting'
  },
  {
    result: { 'copper cable': 2},
    requirements: { 'copper plate': 1 },
    time: 0.5,
    method: 'crafting'
  },
  {
    result: { 'iron plate': 1 },
    requirements: { 'iron ore': 1 },
    time: 3.5,
    method: 'smelting'
  },
  {
    result: { 'iron gear wheel': 1},
    requirements: { 'iron plate': 2 },
    time: 0.5,
    method: 'crafting'
  },
  {
    result: { 'transport belt': 2},
    requirements: { 'iron plate': 1, 'iron gear wheel': 1 },
    time: 0.5,
    method: 'crafting'
  },
  {
    result: { 'electronic circuit': 1},
    requirements: { 'iron plate': 1, 'copper cable': 3 },
    time: 0.5,
    method: 'crafting'
  },
  {
    result: { 'science pack 1': 1},
    requirements: { 'iron gear wheel': 1, 'copper plate': 1 },
    time: 5,
    method: 'crafting'
  },
  {
    result: { 'inserter': 1},
    requirements: { 'iron gear wheel': 1, 'iron plate': 1, 'electronic circuit': 1 },
    time: 0.5,
    method: 'crafting'
  },
  {
    result: { 'science pack 2': 1},
    requirements: { 'inserter': 1, 'transport belt': 1},
    time: 6,
    method: 'crafting'
  },
  {
    result: { 'assembling machine 1': 1},
    requirements: { 'electronic circuit': 3, 'iron gear wheel': 5, 'iron plate': 9},
    time: 0.5,
    method: 'crafting'
  },
  {
    result: { 'assembling machine 2': 1},
    requirements: {'assembling machine 1': 1, 'electronic circuit': 3, 'iron gear wheel': 5, 'iron plate': 9},
    time: 0.5,
    method: 'crafting'
  },
  {
    result: { 'stone furnace': 1},
    requirements: {'stone': 5},
    time: 0.5,
    method: 'crafting'
  },
  {
    result: { 'steel furnace': 1},
    requirements: {'steel plate': 8, 'stone bricks': 10},
    time: 3,
    method: 'crafting'
  },
  {
    result: { 'steel plate': 1},
    requirements: {'iron plate': 5},
    time: 17.5,
    method: 'smelting'
  },
  {
    result: { 'stone brick': 1},
    requirements: {'stone': 2},
    time: 3.5,
    method: 'smelting'
  },
];

},{}]},{},[1]);
