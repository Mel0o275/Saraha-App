import multer from "multer";
import fs from "fs";
import path from "path";

export const fieldValidation = {
    image : ["image/jpeg",
        "image/png",
        "image/gif",
        "image/webp"
    ],
    video : ["video/mp4",
        "video/mpeg",
        "video/quicktime",
        "video/x-ms-wmv"
    ]
}

export const upload = ({ customPath= "general", validation=[], size=5 }) => {
    const fullPath = path.join("uploads", customPath);

    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true }); 

    }
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, fullPath);
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random());
            const filename = `${file.fieldname}-${uniqueSuffix}-${file.originalname}`;
            file.finalPath = path.join(fullPath, filename);
            cb(null, filename);
        }
    });

    const fileFilter = (req, file, cb) => {
        if (validation.length === 0 || validation.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Invalid file type"), false);
        }
    };

    return multer({ storage, fileFilter, limits: { fileSize: size * 1024 * 1024 } });
};