require("dotenv").config();
const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

// O'zbekistondagi viloyatlar va yirik shaharlar ro'yxati
const uzbekistanRegions = {
    "toshkent": ["Toshkent", "Chirchiq", "Angren", "Bekobod", "Olmaliq", "Yangiyo‘l"],
    "samarqand": ["Samarqand", "Urgut", "Kattaqo'rg'on", "Jomboy", "Ishtixon", "Bulung‘ur"],
    "buxoro": ["Buxoro", "G‘ijduvon", "Vobkent", "Olot", "Shofirkon", "Qorako‘l"],
    "farg‘ona": ["Farg‘ona", "Qo‘qon", "Marg‘ilon", "Beshariq", "Rishton", "Quva"],
    "andijon": ["Andijon", "Asaka", "Shahrixon", "Xonobod", "Jalaquduq", "Oltinko‘l"],
    "namangan": ["Namangan", "Chust", "Pop", "Kosonsoy", "Uchqo‘rg‘on", "To‘raqo‘rg‘on"],
    "xorazm": ["Urganch", "Xiva", "Pitnak", "Gurlan", "Yangibozor", "Shovot"],
    "navoiy": ["Navoiy", "Zarafshon", "Uchquduq", "Qiziltepa", "Konimex"],
    "qashqadaryo": ["Qarshi", "Shahrisabz", "G‘uzor", "Kasbi", "Dehqonobod", "Muborak"],
    "surxondaryo": ["Termiz", "Sherobod", "Denov", "Boysun", "Jarqo‘rg‘on", "Sariosiyo"],
    "sirdaryo": ["Guliston", "Yangiyer", "Shirin", "Sirdaryo", "Boyovut"],
    "jizzax": ["Jizzax", "Gagarin", "Paxtakor", "Zomin", "G‘allaorol", "Do‘stlik"],
    "qoraqalpog‘iston": ["Nukus", "Beruniy", "Xo‘jayli", "To‘rtko‘l", "Mo‘ynoq", "Chimboy"]
};


// API orqali namoz vaqtlarini olish
app.get("/ramazon/:viloyat/:shahar", async (req, res) => {
    let viloyat = req.params.viloyat.toLowerCase();
    let shahar = req.params.shahar.toLowerCase();
    
    if (!uzbekistanRegions[viloyat]) {
        return res.status(400).json({ xato: "Noto‘g‘ri viloyat nomi! Iltimos, to‘g‘ri viloyatni kiriting." });
    }

    let matchedCity = uzbekistanRegions[viloyat].find(c => c.toLowerCase() === shahar);
    if (!matchedCity) {
        return res.status(400).json({ 
            xato: `Viloyatda bunday shahar topilmadi! Mavjud shaharlar: ${uzbekistanRegions[viloyat].join(", ")}` 
        });
    }

    try {
        const response = await axios.get(`http://api.aladhan.com/v1/timingsByCity`, {
            params: {
                city: matchedCity,
                country: "Uzbekistan",
                method: 2, // Muslim World League uslubi
            },
        });

        res.json({
            viloyat,
            shahar: matchedCity,
            sana: response.data.data.date.readable,
            namoz_vaqtlari: {
                bomdod: response.data.data.timings.Fajr,
                quyosh_chiqishi: response.data.data.timings.Sunrise,
                peshin: response.data.data.timings.Dhuhr,
                asr: response.data.data.timings.Asr,
                shom: response.data.data.timings.Maghrib,
                xufton: response.data.data.timings.Isha
            }
        });
    } catch (error) {
        res.status(500).json({ xato: "API xatosi yoki ma'lumot topilmadi!" });
    }
});

app.listen(PORT, () => {
    console.log(`Server ${PORT}-portda ishga tushdi`);
});
