const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
app.set("view engine", "ejs");
mongoose.connect("mongodb://localhost:27017/todolistDB");
const itemSchema = {
  name: String
};
const Item = mongoose.model("item", itemSchema);
const item1 = new Item({
  name: "Workout"
});
const item2 = new Item({
  name: "Homework"
});
const item3 = new Item({
  name: "Internship work"
});
const defaultItems = [item1, item2, item3];
const customSchema = {
  name: String,
  list: [itemSchema]
}
const CustomItem = mongoose.model("CustonItem", customSchema);
let workList = [];
app.get("/", function(req, res) {
  Item.find({}, function(err, foundItem) {
    if (foundItem.length == 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("succesfully saved");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        kindOfday: "today",
        newitems: foundItem
      });

    }
  });
});
app.get("/:newList", function(req, res) {
  const newList = _.capitalize(req.params.newList);

  CustomItem.findOne({
    name: newList
  }, function(err, foundItem) {
    if (!err) {
      if (!foundItem) {
        const customItem = new CustomItem({
          name: newList,
          list: defaultItems
        });
        customItem.save();
        res.redirect("/" + newList);
      } else {
        res.render("list", {
          kindOfday: foundItem.name,
          newitems: foundItem.list
        });
      }
    }
  });
});
app.post("/delete", function(req, res) {
  const checkedId = req.body.checkbox;
  const listName = req.body.listName;
  if (listName === "today") {
    Item.findByIdAndRemove(checkedId, function(err) {
      if (err) {
        console.log("error");
      } else {
        console.log("item succesfully deleted");
      }
    });
    res.redirect("/");
  } else {
    CustomItem.findOneAndUpdate({
      name: listName
    }, {
      $pull: {
        list: {
          _id: checkedId
        }
      }
    }, function(err) {
      if (!err) {
        res.redirect("/" + listName);
      }
    });

  }

});
app.post("/", function(req, res) {
  const newItem = req.body.stuff;
  const listName = req.body.list;
  const item = new Item({
    name: newItem
  });
  item.save();
  if (listName === "today") {
    item.save();
    res.redirect("/");
  } else {
    CustomItem.findOne({
      name: listName
    }, function(err, foundList) {
      foundList.list.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });

  }
});

app.listen(3000, function() {
  console.log("server Started at port 3000");
});
