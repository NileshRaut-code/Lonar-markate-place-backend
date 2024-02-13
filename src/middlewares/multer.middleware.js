import multer from "multer";

const storage = multer.diskStorage({
  //to store in temp but vercel pe nahi ho raha he isliye comment kia he
  // destination: function (req, file, cb) {
  //   cb(null, "./public/temp")
  // },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

export const upload = multer({
  storage,
});
