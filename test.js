const FileService = require("./backend/src/services/FileService");

const image_url =
  "https://scontent.fsgn2-6.fna.fbcdn.net/v/t39.30808-1/436402126_2185470491785387_8195911243358730288_n.jpg?stp=c0.5000x0.5000f_dst-webp_e15_p41x41_q70_tt1_u&efg=eyJ1cmxnZW4iOiJ1cmxnZW5fZnJvbV91cmwifQ&_nc_eui2=AeGBqD1MKCREPMZh5-kvGX0jkCH2tvlFZGKQIfa2-UVkYgvx0Q09m5T3fYJzWTeUYkiRLC7DXjjcYAoKxOiObM2H&_nc_cid=0&_nc_ad=z-m&_nc_rml=0&_nc_ht=scontent.fsgn2-6.fna&_nc_cat=110&_nc_ohc=T6QspuDYVLgQ7kNvgG_qzs4&_nc_gid=A5fDyLTHu6VGj9mo736slA8&ccb=1-7&_nc_sid=6738e8&oh=00_AYARzsKncyqNVYbKARG4iR-YpAIxczZwTpbocLK35thdWw&oe=676868F6";
const imageBlob = Buffer.from(image_url, "base64");
console.log(imageBlob);
const abc = async () => {
    const image = await FileService.uploadFile(imageBlob, "image");
    console.log(image, image);
}
abc();