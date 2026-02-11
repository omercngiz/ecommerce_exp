# Frontend Klasör Yapısı

```
frontend/
├── public/              # Statik dosyalar
│   └── index.html       # Ana HTML dosyası
├── src/
│   ├── components/      # Tekrar kullanılabilir componentler
│   │   ├── navbar.html
│   │   ├── navbar.css
│   │   ├── footer.html
│   │   └── footer.css
│   ├── pages/           # Sayfa componentleri
│   │   ├── home.html
│   │   ├── home.css
│   │   └── ...
│   ├── styles/          # Global CSS
│   │   ├── global.css
│   │   └── variables.css
│   ├── assets/          # Resimler, ikonlar
│   │   ├── images/
│   │   └── icons/
│   └── js/              # JavaScript dosyaları
│       └── app.js
├── index.js             # Node.js server
└── package.json
```

## Kullanım

Component tabanlı yapı - her component kendi HTML ve CSS dosyasına sahip.

### Yeni Component Oluşturma

1. `/src/components/` içine `componentname.html` ve `componentname.css` oluştur
2. Component HTML'ine kendi CSS'ini import et:
   ```html
   <link rel="stylesheet" href="../src/components/componentname.css">
   ```

### Yeni Sayfa Oluşturma

1. `/src/pages/` içine `pagename.html` ve `pagename.css` oluştur
2. `app.js` içinde sayfayı yükle
