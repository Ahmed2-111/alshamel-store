import mongoose from "mongoose";

const storeSettingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: "default" },
    storeName: { type: String, default: "متجر الشامل" },
    logo: String,
    email: String,
    phones: [String],
    socials: {
      instagram: String,
      facebook: String,
      x: String,
      whatsapp: String
    },
    privacyPolicy: String,
    terms: String,
    defaultCountry: { type: String, default: "YE" },
    defaultCurrency: { type: String, default: "YER" },
    supportedCountries: [String],
    supportedCurrencies: [String],
    translations: {
      ar: { storeName: String, privacyPolicy: String, terms: String },
      en: { storeName: String, privacyPolicy: String, terms: String }
    }
  },
  { timestamps: true }
);

export default mongoose.model("StoreSetting", storeSettingSchema);
