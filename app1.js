const express = require("express");
const _ = require("lodash");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const fs=require('fs');
const path=require('path');
const request=require('request');
const https=require('https');

//db
var mongoose=require('mongoose');

mongoose.connect("mongodb://localhost:27017/blogDBcopy", { useNewUrlParser: true });



// Step 5 - set up multer for storing uploaded files

var multer = require('multer');

var storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'uploads')
	},
	filename: (req, file, cb) => {
		cb(null, file.fieldname + '-' + Date.now())
	}
});

var upload = multer({ storage: storage });

// Step 6 - load the mongoose model for Image

var ob = require('./models');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
// app.use(express.static("public"));
app.use(express.static(__dirname + '/public'));


let posts=[];
let categories=[];

app.get("/",(req,res)=>{
  ob.Post.find({}, function(err, arr){
      posts=arr;      
 
  });  

  ob.Category.find({},function(err,arr){
      categories=arr;
      res.render("home",{
        posts:posts,
        categories:categories      
    });

  })
   
});

app.get("/about",(req,res)=>{
  ob.Category.find({},function(err,arr){
    categories=arr;
    res.render("about",{
      
      categories:categories      
  });

})
  
})

app.get("/events",(req,res)=>{
  ob.Category.find({},function(err,arr){
    categories=arr; 
});
ob.Event.find({},function(err,eventsArray){
  res.render('events',{
    categories:categories,
    eventsArray:eventsArray
  })
})
});

app.get("/books",(req,res)=>{
  ob.Category.find({},function(err,arr){
    categories=arr;   
  });
  ob.Book.find({},function(err,booksArray){
    res.render('books',{
      categories:categories,
      booksArray:booksArray
    })
  })
});

app.get("/compose",(req,res)=>{
  ob.Category.find({},function(err,arr){
    
    res.render("compose",{
      
      categories:arr    
  });
  
})
});

app.get("/categories/",function(req,res){
  const requestedCategory=req.query.cat;
  // console.log(requestedCategory);

  ob.Category.find({},function(err,arr){
    categories=arr;
    
  })
    
    ob.Post.find({"postCategory.name":requestedCategory},function(err,postsArray){
      // console.log(postsArray);
      res.render("category",{postsArray:postsArray,requestedCategory:requestedCategory,categories:categories})

    })
})

app.get("/change/:postId",function(req,res){

  let requestedPostId=req.params.postId;


  ob.Category.find({},function(err,arr){
    categories=arr;

  })
  
  ob.Post.findOne({_id:requestedPostId},function(err,post){
       
    res.render('edit',{
      post:post,
      categories:categories
    })
  });
  
  })

app.get("/posts/:postId",(req,res)=>{
  let requestedPostId=req.params.postId;


  ob.Category.find({},function(err,arr){
    categories=arr;

  })
  
  ob.Post.findOne({_id:requestedPostId},function(err,post){
       
    res.render('post',{
      post:post,
      categories:categories
    })
  });
  
  })

  
  app.get("/deleted",function(req,res){
    ob.Category.find({},function(err,arr){
      categories=arr;
  
    })
    const result="deleted";
    res.render("msg",{categories:categories,result:result})
  })

  app.get("/delete/:postId",function(req,res){
    const requestedPostId=req.params.postId;
    ob.Post.deleteOne({_id:requestedPostId},function(err){
      if(err) throw err;
      
    })
    res.redirect("/deleted");
  })

  app.get("/updated",function(req,res){
    ob.Category.find({},function(err,arr){
      categories=arr;
  
    })

    const result="updated";
    res.render("msg",{categories:categories,result:result})
    
  })

  app.get("/change",function(req,res){
    ob.Category.find({},function(err,arr){
      categories=arr;
  
    })
    ob.Post.find({},function(err,postsArray){
      res.render("change",{postsArray:postsArray,categories:categories})
    }) 
    
  }) 

app.get("/composeBook",function(req,res){
  ob.Category.find({},function(err,arr){
    categories=arr;

  })
  res.render('composeBook',{
    categories:categories
  })

})

app.get("/books/:bookId",function(req,res){
  const requestedBookId=req.params.bookId;
  ob.Book.findOne({_id:requestedBookId},function(err,book){       
    res.render('book',{
      book:book,
      categories:categories
    })
  });

})

app.get("/composeEvent",function(req,res){
  ob.Category.find({},function(err,arr){
    categories=arr;

  })
  res.render('composeEvent',{
    categories:categories
  })

})

app.get("/event/:eventId",function(req,res){
  const requestedEventId=req.params.eventId;
  ob.Event.findOne({_id:requestedEventId},function(err,event){       
    res.render('event',{
      event:event,
      categories:categories
    })
  });

})

app.post("/change/change/:postId",upload.single('image'),function(req,res,next){
  const requestedPostId=req.params.postId;
  const title=req.body.postTitle;
  const content=req.body.postContent;
  const featuredChoice=req.body.featuredChoice;

  const newImg = {
    data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
    contentType: 'image/png'
  }

  ob.Post.updateOne({_id:requestedPostId},
  {"postTitle":title,"postContent":content,"isFeatured":featuredChoice,img:newImg},
  function(err){
    if(err) throw err;    

  })
  res.redirect("/updated");
})


app.post("/compose",upload.single('image'),(req,res,next)=>{

    const chosenCatLower=_.lowerCase([string=req.body.chosenCategory]);

    const chosenCat=new ob.Category({
        name:chosenCatLower
    });

    ob.Category.find({}, function(err, arr){
        let s=0;

        arr.forEach(ele=>{            
            if(ele.name===chosenCat.name){
                s=1;
            }
            
        })
        if(s==0){            
            chosenCat.save();            
        }
     
      });         

  const newPost=new ob.Post({
    postTitle:req.body.postTitle,
    postContent:req.body.postContent,
    img: {
      data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
      contentType: 'image/png'
  },  
  postCategory:chosenCat,
  isFeatured:req.body.featuredChoice
  });
  ob.Post.create(newPost, (err, item) => {
    if (err) {
        console.log(err);
    }
    else {
        // item.save();
        res.redirect('/');
    }
});
  
  
})

app.post("/composeBook",upload.single('image'),(req,res,next)=>{      

const newBook=new ob.Book({
  bookTitle:req.body.bookTitle,
  bookSummary:req.body.bookSummary,
  img: {
    data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
    contentType: 'image/png'
}
});
ob.Book.create(newBook, (err, item) => {
  if (err) {
      console.log(err);
  }
  else {
      // item.save();
      res.redirect('/');
  }
});
})

app.post("/composeEvent",upload.single('image'),(req,res,next)=>{      

  const newEvent=new ob.Event({
    eventName:req.body.eventName,
    eventSummary:req.body.eventSummary,
    img: {
      data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
      contentType: 'image/png'
  }
  });
  ob.Event.create(newEvent, (err, item) => {
    if (err) {
        console.log(err);
    }
    else {
        // item.save();
        res.redirect('/');
    }
  });
  })

  //newsletter signup for Zulie Rane to have her own email list using MailChimp API
  app.get("/subscribe",(req,res)=>{
    res.render('signup');
    
});

app.post("/subscribe",(req,res)=>{
    const firstName=req.body.fn;
    const lastName=req.body.ln;
    const email=req.body.email;    
    const data={
        members:[
            {
                email_address:email,
                status:"subscribed",
                merge_fields:{
                    FNAME:firstName,
                    LNAME:lastName
                }
            }
        ]

    }
    const jsonData=JSON.stringify(data);
    const url="https://us14.api.mailchimp.com/3.0/lists/d7d4231c64";
    const options={
        method:"POST",
        auth:"nithyashree:970db5ec78b65bc4ee1c97b2714eb1e6-us14"
    }

    const request=https.request(url,options,(resp)=>{
        if(resp.statusCode==200)
          res.render('signupMsg',{res1:"Woah!",msg:"Thank you for signing up to my newsletter!"});            
        else
          res.render('signupMsg',{res1:"Oops!",msg:"Something went wrong while signing you up!"}); 
                     
        // resp.on("data",(data)=>{
        //     console.log(JSON.parse(data))
        // });
        
    });

    request.write(jsonData);
    request.end();
    
    
});

app.post("/failed",(req,res)=>{
    res.redirect("/");  //redirect to home root
});




app.listen(3000, function() {
  console.log("Server started on port 3000");
});

// API Key: 970db5ec78b65bc4ee1c97b2714eb1e6-us14
// Audience ID or List ID: d7d4231c64
//MailChimp