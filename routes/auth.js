const express = require('express');
const router = express.Router();
const ActiveDirectory = require('activedirectory');

// Active Directory Konfigürasyonu
const config = {
  url: 'ldap://localhost',
  baseDN: 'dc=mertidm,dc=com',
  username: 'CN=Administrator,CN=Users,DC=mertidm,DC=com',
  password: 'Mert123!'
};

const ad = new ActiveDirectory(config);

// Giriş Sayfası
router.get('/', (req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  res.render('login', { error: null });
});

// Giriş İşlemi
router.post('/login', (req, res) => {
    const { username, password } = req.body;
  
    ad.authenticate(username, password, async (err, auth) => {
      if (err) {
        console.error('Hata:', err);
        return res.render('login', { error: 'Hatalı kullanıcı adı veya şifre.' });
      }
  
      if (auth) {
        ad.findUser(username, async (err, user) => {
          if (err) {
            console.error('Kullanıcı bilgileri alınamadı:', err);
            return res.render('login', { error: 'Kullanıcı bilgileri alınamadı.' });
          }

          req.session.user = username;
          req.session.fullName = user.displayName || `${user.givenName} ${user.sn}`;
        
          // Yetki kontrolünü Promise ile sarmalıyoruz
          try {
            await new Promise((resolve, reject) => {
              ad.getGroupMembershipForUser(username, function(err, groups) {
                if (err) {
                  console.log('ERROR: ' + JSON.stringify(err));
                  reject(err);
                  return;
                }
  
                if (!groups) {
                  console.log('User: ' + username + ' not found.');
                  req.session.auth = [];
                } else {
                  const authorization = groups
                    .filter(group => group.dn.includes('OU=TestAPP'))
                    .map(group => group.cn);
  
                  req.session.auth = authorization;
                  console.log(req.session.auth);
                }
                resolve();
              });
            });
  
            // Yetki kontrolü tamamlandıktan sonra yönlendirme yapılıyor
            res.redirect('/dashboard');
          } catch (error) {
            console.error('Yetki kontrolü hatası:', error);
            res.render('login', { error: 'Yetki kontrolü sırasında bir hata oluştu.' });
          }
        });
      } else {
        res.render('login', { error: 'Kimlik doğrulama başarısız.' });
      }
    });
  });

// Çıkış İşlemi
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;