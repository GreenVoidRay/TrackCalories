const StorageCtrl = (function(){
    return {
        loadItems: function(){
            const items = JSON.parse(localStorage.getItem('items'));
            if(items){
                ItemCtrl.setItems(items);
                ItemCtrl.initCalories();
                return items;
            }
            return [];
        },
        updateStorage(){
            localStorage.setItem('items', JSON.stringify(ItemCtrl.getItems()));
        }
    }
})();

const ItemCtrl = (function() {
    const Item = function(id, name, calories){
        this.id = id;
        this.name = name;
        this.calories = calories;
    }
    const data = {
        items: [
            //{id: 0, name: 'Steak Dinner', calories: 1200},
            //{id: 1, name: 'Cookie', calories: 400},
            //{id: 2, name: 'Eggs', calories: 300}
        ],
        currentItem: null,
        totalCalories: 0
    }
    const generateId = function(){
        if(data.items.length > 0)
            return data.items[data.items.length-1].id+1;
        else return 0;
    }

    return {
        logData: function(){
            return data;
        },
        setItems(items){
            data.items = items;
        },
        getItems(){
            return data.items;
        },
        getItem(id){
            return data.items.find(item => item.id === id);
        },
        addItem: function(name, calories){
            const newId = generateId();
            calories = parseInt(calories);
            const item = new Item(newId, name, calories);
            data.items.push(item);
            data.totalCalories += item.calories;
            return item;
        },
        initCalories: function(){
            if(data.items)
                data.totalCalories = data.items.reduce((acc, curr) => acc += curr.calories, 0);
        },
        getTotalCalories: function(){
            return data.totalCalories;
        },
        setCurrentItem(item){
            data.currentItem = item;
        },
        getCurrentItem(){
            return data.currentItem;
        },
        updateItem(name, calories){
            return data.items.find(item => {
                if(item.id === data.currentItem.id) {
                    data.totalCalories += (calories - item.calories);
                    item.name = name;
                    item.calories = calories;
                    return item;
                }
            });
        },
        deleteItem(){
            let indexItem = data.items.findIndex(item => item.id === data.currentItem.id);
            data.totalCalories -= data.currentItem.calories;
            data.items.splice(indexItem, 1);
        },
        clearAllItems(){
            data.items = [];
            data.currentItem = null;
            data.totalCalories = 0;
        }
    }
})()

const UICtrl = (function() {
    // if id of item-list is changed, we change it only from here, not in the hole app
    const UISelectors = {
        itemList: '#item-list',
        addBtn: '.add-btn',
        updateBtn: '.update-btn',
        deleteBtn: '.delete-btn',
        backBtn: '.back-btn',
        itemName: '#item-name',
        itemCalories: '#item-calories',
        totalCalories: 'span.total-calories',
        clearAllBtn: '.clear-btn'
    }

    return {
        populateItemList: function(items){
            let html = '';
            items.forEach(item => {
                html += `
                <li class="collection-item" id="item-${item.id}">
                    <strong>${item.name}: </strong> <em>${item.calories} Calories</em>
                    <a href="#" class="secondary-content">
                        <i class="edit-item fa fa-pencil"></i>
                    </a>
                </li>
                `;
            });
            document.querySelector(UISelectors.itemList).innerHTML = html;
        },
        getItemInput: function(){
            return {
                name: document.querySelector(UISelectors.itemName).value,
                calories: document.querySelector(UISelectors.itemCalories).value,
            }
        },

        getSelectors: function(){
            return UISelectors;
        }, 

        addListItem: function(item){
            document.querySelector(UISelectors.itemList).style.display = 'block';
            document.querySelector(UISelectors.itemList).innerHTML += `
            <li class="collection-item" id="item-${item.id}">
                <strong>${item.name}: </strong> <em>${item.calories} Calories</em>
                <a href="#" class="secondary-content">
                    <i class="edit-item fa fa-pencil"></i>
                </a>
            </li>
            `;
        },
        updateListItem: function(item){
            const toUpdateListItem = document.querySelector(`#item-${item.id}`);
            toUpdateListItem.querySelector('strong').textContent = `${item.name}: `;
            toUpdateListItem.querySelector('em').textContent = `${item.calories} Calories`;
        },
        deleteListItem: function(item){
            const toDeleteListItem = document.querySelector(`#item-${item.id}`);
            toDeleteListItem.remove();
        },
        clearInput: function(){
            document.querySelector(UISelectors.itemName).value = '';
            document.querySelector(UISelectors.itemCalories).value = '';
        },
        clearEditSTATE: function(){
            UICtrl.clearInput();
            document.querySelector(UISelectors.updateBtn).style.display = 'none';
            document.querySelector(UISelectors.deleteBtn).style.display = 'none';
            document.querySelector(UISelectors.backBtn).style.display = 'none';
            document.querySelector(UISelectors.addBtn).style.display = 'inline';
        },
        paintEditSTATE: function(){
            document.querySelector(UISelectors.updateBtn).style.display = 'inline';
            document.querySelector(UISelectors.deleteBtn).style.display = 'inline';
            document.querySelector(UISelectors.backBtn).style.display = 'inline';
            document.querySelector(UISelectors.addBtn).style.display = 'none';
        },
        addItemToForm: function(item){
            document.querySelector(UISelectors.itemName).value = item.name;
            document.querySelector(UISelectors.itemCalories).value = item.calories;
        },
        hideItemList: function(){
            document.querySelector(UISelectors.itemList).style.display = 'none';
        },
        clearAllListItems: function(){
            document.querySelector(UISelectors.itemList).innerHTML = "";
        },
        showTotalCalories(totalCalories){
            document.querySelector(UISelectors.totalCalories).textContent = totalCalories;
        }
    }
})()

const App = (function(ItemCtrl, StorageCtrl, UICtrl) {
    const loadEventListeners = function(){
        const UISelectors = UICtrl.getSelectors();
        document.querySelector(UISelectors.addBtn).addEventListener('click', itemAddSubmit);
        document.querySelector(UISelectors.itemList).addEventListener('click', itemEditClicked);
        document.querySelector(UISelectors.updateBtn).addEventListener('click', itemUpdateSubmit);
        document.querySelector(UISelectors.deleteBtn).addEventListener('click', itemDeleteClicked);
        document.querySelector(UISelectors.backBtn).addEventListener('click', UICtrl.clearEditSTATE());
        document.querySelector(UISelectors.clearAllBtn).addEventListener('click', clearAllClicked);
        document.addEventListener('keypress', (e) => {
            if(e.keyCode === 13 || e.which === 13){
                e.preventDefault();
                return false;
            }
        })
    }

    const itemAddSubmit = (e) => {
        const input = UICtrl.getItemInput();
        if(input.name && input.calories){
            const newItem = ItemCtrl.addItem(input.name, input.calories);
            UICtrl.addListItem(newItem);
            UICtrl.clearInput();
            UICtrl.showTotalCalories(ItemCtrl.getTotalCalories());
            StorageCtrl.updateStorage(newItem);
        }
        e.preventDefault();
    }

    const itemEditClicked = (e) => {
        if(e.target.classList.contains('edit-item')){
            let itemId = parseInt(e.target.parentNode.parentNode.id.replace('item-', ""));
            let itemToEdit = ItemCtrl.getItem(itemId);
            ItemCtrl.setCurrentItem(itemToEdit);
            UICtrl.addItemToForm(itemToEdit);
            UICtrl.paintEditSTATE();
        }
        e.preventDefault();
    }
    const itemUpdateSubmit = (e) => {
        const input = UICtrl.getItemInput();
        const updatedItem = ItemCtrl.updateItem(input.name, input.calories);
        UICtrl.updateListItem(updatedItem);
        UICtrl.showTotalCalories(ItemCtrl.getTotalCalories());
        StorageCtrl.updateStorage();
        UICtrl.clearEditSTATE();
        e.preventDefault();
    }
    const itemDeleteClicked = (e) => {
        ItemCtrl.deleteItem();
        UICtrl.deleteListItem(ItemCtrl.getCurrentItem());
        StorageCtrl.updateStorage();
        UICtrl.showTotalCalories(ItemCtrl.getTotalCalories());
        UICtrl.clearEditSTATE();
        e.preventDefault();
    }
    const clearAllClicked = (e) => {
        ItemCtrl.clearAllItems();
        UICtrl.clearAllListItems();
        StorageCtrl.updateStorage();
        UICtrl.showTotalCalories(ItemCtrl.getTotalCalories());
        e.preventDefault();
    }
    return {
        init: function(){
            UICtrl.clearEditSTATE();
            const items = StorageCtrl.loadItems();
            if(items.length === 0){
                UICtrl.hideItemList();
            }
            else{
                UICtrl.populateItemList(items);
            }
            ItemCtrl.initCalories();
            UICtrl.showTotalCalories(ItemCtrl.getTotalCalories());
            loadEventListeners();
        }
    }
})(ItemCtrl, StorageCtrl, UICtrl)

App.init();
