var budgetController = (function(){
  var Expense = function(id, description, value){
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function(totalIncome){
    if(totalIncome > 0){
      this.percentage = Math.round((this.value/totalIncome) * 100);
    }else{
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function(){
    return this.percentage;
  };

  var Income = function(id, description, value){
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function(type){
    var sum = 0;
    data.allItems[type].forEach(function(item){
      sum+=item.value;
    });
    data.totals[type] = sum;
  };

  var data = {
    allItems : {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget:0,
    percentage:-1
  };

  return {
    addItem: function(type, des, val){
      var newItem, ID;

      if(data.allItems[type].length > 0){
        ID = data.allItems[type][data.allItems[type].length-1].id + 1;
      }else{
        ID = 0;
      }

      if(type === 'exp'){
        newItem = new Expense(ID, des, val);
      }else if(type === 'inc'){
        newItem = new Income(ID, des, val);
      }

      data.allItems[type].push(newItem);
      return newItem;

    },

    deleteItem: function(type, id){
      var ids,index;
      ids = data.allItems[type].map(function(item){
        return item.id;
      });

      index = ids.indexOf(id);

      if(index !== -1){
        data.allItems[type].splice(index,1);
      }
    },

    calculateBudget: function(){
      calculateTotal('inc');
      calculateTotal('exp');

      data.budget = data.totals.inc - data.totals.exp;

      if(data.totals.inc > 0){
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      }else{
        data.percentage = -1;
      }
    },

    getBudget: function(){
      return{
        budget: data.budget,
        totalIncome: data.totals.inc,
        totalExpenses: data.totals.exp,
        percentage: data.percentage
      };
    },

    testing: function(){
      console.log(data);
    },

    calculatePercentages: function(){
      data.allItems.exp.forEach(function(item){
        item.calcPercentage(data.totals.inc);
      });
    },

    getPercentages: function(){
      var allPerc = data.allItems.exp.map(function(item){
        return item.getPercentage();
      });
      return allPerc;
    }

  };

})();

var UIController = (function(){
  var DOMStrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    expenseContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expenseLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    continer: '.container',
    expensePercentageLabel: '.item__percentage',
    dateLabel: '.budget__title--month'
  };

  return {
    getInput: function(){
      return {
        type: document.querySelector(DOMStrings.inputType).value,
        description: document.querySelector(DOMStrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
      };
    },

    getDOMstrings: function(){
      return DOMStrings;
    },

    addListItem: function(obj,type){
      var html, newHtml, element;
      if(type === 'inc'){
        element = DOMStrings.incomeContainer;
        html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }else if(type === 'exp'){
        element = DOMStrings.expenseContainer;
        html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', obj.value);

      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },

    deleteListItem: function(selectorID){
      var el;
      el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },

    displayBudget: function(obj){
      document.querySelector(DOMStrings.budgetLabel).textContent = obj.budget;
      document.querySelector(DOMStrings.incomeLabel).textContent = obj.totalIncome;
      document.querySelector(DOMStrings.expenseLabel).textContent = obj.totalExpenses;

      if(obj.percentage > 0){
        document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + "%";
      }else{
        document.querySelector(DOMStrings.percentageLabel).textContent = "---";
      }
    },

    displayPercentage: function(percentages){
      var fields = document.querySelectorAll(DOMStrings.expensePercentageLabel);

      var nodeListForEach = function(list, callback){
        for(var i=0; i<list.length; i++)
          callback(list[i], i);
      };

      nodeListForEach(fields, function(item, index){
        if(percentages[index] > 0){
          item.textContent = percentages[index] + '%';
        }else{
          item.textContent = '---';
        }
      });

    },

    displayMonth: function(){
      var now, month, months, year;
      now = new Date();
      year = now.getFullYear();
      months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      month = now.getMonth();
      document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year;
    },

    clearFields: function(){
      var fields, fieldsArr;
      fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);
      fieldsArr = Array.prototype.slice.call(fields);
      fieldsArr.forEach(function(field){
        field.value = "";
      });
      fieldsArr[0].focus();
    }

  };
})();

var controller = (function(budgetCtrl, UICtrl){
  var setupEventListeners = function(){
    //setting event listeners for adding items
    var DOM = UICtrl.getDOMstrings();
    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
    document.addEventListener('keypress', function(event){
      if(event.keyCode === 13 || event.which === 13){
        ctrlAddItem();
      }
    });
    //setting up an event listener for deleting an item
    document.querySelector(DOM.continer).addEventListener('click', ctrlDeleteItem);
  };

  var budgetUpdate = function(){
    //1.Calculate The Budget
    budgetCtrl.calculateBudget();

    //2.Return the budget
    var budget = budgetCtrl.getBudget();

    //3.Display the budget on the ui
    UICtrl.displayBudget(budget);
  };

  //updating percentages and adding it to the UI
  var updatePercentages = function(){
    //1.Calculate Percentages
    budgetCtrl.calculatePercentages();

    //2.read percentages from the budget controller
    var percentages = budgetCtrl.getPercentages();

    //3.update the percentages on the ui
    UICtrl.displayPercentage(percentages);
  };

  //deleting an item
  var ctrlDeleteItem = function(event){
    var itemID, splitID, ID, type;
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
    if(itemID){
      splitID = itemID.split('-');
      type = splitID[0];
      ID = parseInt(splitID[1]);
      //1.Delete item from the data
      budgetCtrl.deleteItem(type,ID);

      //2.Delete item from the interface
      UICtrl.deleteListItem(itemID);

      //3.Calculate the updated budget and display
      budgetUpdate();
    }
  };


  //adding an item
  var ctrlAddItem = function(){
    var input, newItem;

    //1.Get the input data from UI
    input = UICtrl.getInput();

    if(input.description !== "" && input.value !== 0 && !isNaN(input.value)){
      //2.Add the item to budgetController
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);

      //3.Display the items on the UI
      UICtrl.addListItem(newItem, input.type);

      //4.Remove items from the input box
      UICtrl.clearFields();

      //5.Update Budget
      budgetUpdate();

      //6.Update Percentages
      updatePercentages();
    }
  };

  return{
    init: function(){
      console.log('Application has started');
      UICtrl.displayMonth();
      UICtrl.displayBudget({
          budget:0,
          totalIncome:0,
          totalExpenses:0,
          percentage:-1
      });
      setupEventListeners();
    }
  };

})(budgetController,UIController);


controller.init();
