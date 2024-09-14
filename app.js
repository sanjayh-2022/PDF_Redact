const express=require('express');
const app=express();
const session=require('express-session');
const path=require('path');
const cors=require('cors');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const port=3000;
const ejsmate=require("ejs-mate");
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const methodoverride=require('method-override');
app.set('view engine','ejs');
app.set('views',path.join(__dirname,"/views"));
app.use(express.static(path.join(__dirname,'/public')));
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.engine('ejs',ejsmate);
app.use(methodoverride("_method"));
const multer = require('multer');




//session options
sessionOptions={
    secret:"processenvSECRET",
    resave:false,
    saveUninitialized:true,
    cookie:{
      expires: Date.now() + 7*24*60*60*1000,
      maxAge:7*24*60*60*1000,
      httpOnly:true
    }
  };
  

  // Configure multer to store files in the 'uploads' directory
const upload = multer({ 
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/'); // Specify the uploads directory
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname); // Use the original file name
    }
  })
});


//using sessions
app.use(session(sessionOptions))



//Listening
app.listen(port,()=>{
    console.log(`Listening on port ${port}`);
});

app.use((req, res, next) => {
  if (!req.session.originalfilename) {
    req.session.originalfilename = null; // or any default value, like 0
  }
  if (!req.session.data) {
    req.session.data = null; // or any default value
  }
  if (!req.session.redactedfilename) {
    req.session.redactedfilename = null; // or any default value
  }
  next();
});

app.get("/", (req, res) => {
  const originalfilename = req.session.originalfilename;
  const data = req.session.data;
  const redactedfilename = req.session.redactedfilename;
  res.render("listings/index.ejs", { originalfilename, data ,redactedfilename});
});




// After a successful file upload, update session variables
app.post('/uploadpdf', upload.single('uploadpdf'), async (req, res) => {
  try {
    const apiUrl = 'https://aswinr24-piicrunch-api.hf.space/pdf/detect';

    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    // Store the file path and original filename in the session
    req.session.originalfilename = req.file.originalname; // Store the original file name in session
    req.session.filepath = req.file.path; // Store the file path in session

    // Read the uploaded file from the file system using fs.createReadStream
    const fileStream = fs.createReadStream(req.file.path);

    // Create a FormData instance and append the file stream
    const formData = new FormData();
    formData.append('file', fileStream, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    // // Send the form-data request to the external API
    // const response = await axios.post(apiUrl, formData, {
    //   headers: {
    //     ...formData.getHeaders(), // Get the proper headers for multipart form-data
    //   },
    // });

    // // Store the API response data in the session
    // req.session.data = response.data;



    req.session.data={
      document_type: 'Aadhaar Card',
      detected_pii: [
        'Aadhaar Number',
        'VID Number',
        'Phone Number',
        'Date of Birth',
        'Address'
      ]
    };

    // Redirect to homepage (or render with updated data)
    res.redirect('/');
  } catch (error) {
    console.error('Error uploading PDF:', error);
    res.status(500).send('Error uploading PDF');
  }
});






app.post('/uploadimage', upload.single('uploadimage'), async (req, res) => {
  try {
    // API endpoint for PII detection
    const apiUrl = 'https://aswinr24-piicrunch-api.hf.space/image/detect';

    // Check if the file was uploaded
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    // Path to the saved file in the 'uploads' directory
    const filePath = path.join(__dirname, req.file.path);

    // Create a FormData instance and append the file
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath), {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    // Send the form-data request to the external API for PII detection
    const response = await axios.post(apiUrl, formData, {
      headers: {
        ...formData.getHeaders(), // Ensure correct headers for 'multipart/form-data'
      },
    });

    // Store the PII data received from the external API in the session
    req.session.data = response.data; // Store PII data in session
    req.session.originalfilename = req.file.originalname; // Store original file name in session

    // Respond with the PII data (not an image)
    res.redirect('/');

  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).send('Error uploading image or detecting PII');
  }
});





app.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', filename); // Define the file path

  // Check if the file exists in the uploads directory
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File not found.');
  }

  // Use res.download to send the file and handle post-download actions
  res.download(filePath, filename, (err) => {
    if (err) {
      console.error(`Error downloading file: ${filePath}`, err);
      return res.status(500).send('Error downloading file.');
    }

    // After the download is completed, delete the file and clear the session
    fs.unlink(filePath, (unlinkErr) => {
      if (unlinkErr) {
        console.error(`Error deleting file: ${filePath}`, unlinkErr);
      } else {
        console.log(`Successfully deleted file: ${filePath}`);

        // Clear the original file information from session
        req.session.originalfilename = null;
        req.session.data = null;

        // Explicitly save the session after clearing data
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error('Error saving session:', saveErr);
            return res.status(500).send('Error saving session.');
          }
          
          console.log('Session cleared and saved.');
        });
      }
    });
  });
});



app.post('/redact-the-doc', (req, res) => {

    const selectedPIIs = req.body.selectedPIIs;
    console.log('Received selected PIIs:', selectedPIIs);

    if (!selectedPIIs) {
      console.log('No PIIs received!');
    }

    // Now you can process the selected PII data and perform the redaction or any other operations
    res.redirect('/');

});

