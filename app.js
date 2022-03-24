const express = require("express");
const _ = require("lodash");
const db = require('./config/connection');
const app = express();
const PORT = process.env.PORT || 3001;
const db = require('./config/connection');
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

// mongoose.connect("mongodb+srv://willy18:520LImeihua@cluster0.3fprr.mongodb.net/todolistDB", {useNewUrlParser: true});

const itemsSchema = {
    name: String
  };
  
  const Item = mongoose.model("Item", itemsSchema);
  
  
  const item1 = new Item({
    name: "Welcome to your todolist!"
  });
  
  const item2 = new Item({
    name: "Hit the + button to add a new item."
  });
  
  const item3 = new Item({
    name: "<-- Hit this to delete an item."
  });
  
  const defaultItems = [item1, item2, item3];


  const listSchema = {
    name: String,
    items: [itemsSchema]
  };
  
  const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

    Item.find({}, function(err, foundItems){
  
      if (foundItems.length === 0) {
        Item.insertMany(defaultItems, function(err){
          if (err) {
            console.log(err);
          } else {
            console.log("Successfully savevd default items to DB.");
          }
        });
        res.redirect("/");
      } else {
        res.render("list", {listTitle: "Today", newListItems: foundItems});
      }
    });
  
});
  
app.get("/:customListName", function(req, res){
    const customListName = _.capitalize(req.params.customListName);
  
    List.findOne({name: customListName}, function(err, foundList){
      if (!err){
        if (!foundList){
          //Create a new list
          const list = new List({
            name: customListName,
            items: defaultItems
          });
          list.save();
          res.redirect("/" + customListName);
        } else {
          //Show an existing list
  
          res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
        }
      }
    });
  
  
  
});

app.post("/", function(req, res){

    const itemName = req.body.newItem;
    const listName = req.body.list;
  
    const item = new Item({
      name: itemName
    });
  
    if (listName === "Today"){
      item.save();
      res.redirect("/");
    } else {
      List.findOne({name: listName}, function(err, foundList){
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      });
    }
});

app.post("/delete", function(req, res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;
  
    if (listName === "Today") {
      Item.findByIdAndRemove(checkedItemId, function(err){
        if (!err) {
          console.log("Successfully deleted checked item.");
          res.redirect("/");
        }
      });
    } else {
      List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
        if (!err){
          res.redirect("/" + listName);
        }
      });
    }
  
  
  });

  
app.get("/about", function(req, res){
    res.render("about");
  });
  
  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
    })
  })