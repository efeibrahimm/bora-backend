from flask import Flask, request, jsonify
import requests
from bs4 import BeautifulSoup
import PyPDF2
import re
from nltk.corpus import stopwords

app = Flask(__name__)

def veri_topla(url):
    try:
        response = requests.get(url)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        metin_icerigi = soup.get_text()
        return metin_icerigi
    except requests.exceptions.HTTPError as errh:
        return f"HTTP Hatası: {errh}"
    except requests.exceptions.ConnectionError as errc:
        return f"Bağlantı Hatası: {errc}"
    except requests.exceptions.Timeout as errt:
        return f"Zaman Aşımı Hatası: {errt}"
    except requests.exceptions.RequestException as err:
        return f"Bilinmeyen bir hata oluştu: {err}"

def pdf_metni_cek(url):
    try:
        response = requests.get(url)
        response.raise_for_status()
        with open('temp.pdf', 'wb') as f:
            f.write(response.content)
        with open('temp.pdf', 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            metin_icerigi_pdf = ""
            for sayfa_numarasi in range(len(pdf_reader.pages)):
                sayfa = pdf_reader.pages[sayfa_numarasi]
                metin_icerigi_pdf += sayfa.extract_text()
        return metin_icerigi_pdf
    except requests.exceptions.HTTPError as errh:
        return f"HTTP Hatası: {errh}"
    except requests.exceptions.ConnectionError as errc:
        return f"Bağlantı Hatası: {errc}"
    except requests.exceptions.Timeout as errt:
        return f"Zaman Aşımı Hatası: {errt}"
    except requests.exceptions.RequestException as err:
        return f"Bilinmeyen bir hata oluştu: {err}"

def hangi_bitkiler_ve_tohumlar_ne_zaman(metin, kullanici_ay):
    desen_bitkiler = r'(?i)(' + kullanici_ay + r').*?((?:(?:[\w\s,]+)(?: ekilir| ekilmelidir| yetişir| yetişmelidir)))'
    eslesmeler_bitkiler = re.findall(desen_bitkiler, metin)

    desen_tohumlar = r'(?i)(' + kullanici_ay + r').*?((?:(?:[\w\s,]+)(?: tohumu ekilir)))'
    eslesmeler_tohumlar = re.findall(desen_tohumlar, metin)

    sonuc_bitkiler = f"{kullanici_ay.capitalize()} ayında bitki ekimiyle ilgili bilgi bulunamadı."
    sonuc_tohumlar = f"{kullanici_ay.capitalize()} ayında tohum ekimiyle ilgili bilgi bulunamadı."

    if eslesmeler_bitkiler:
        _, bitkiler = eslesmeler_bitkiler[0]
        bitki_listesi = [kelime.strip() for kelime in re.findall(r'\b\w+\b', bitkiler)]
        sonuc_bitkiler = f"{kullanici_ay.capitalize()} ayında ekilebilecek bitkiler: {', '.join(bitki_listesi)}"

    if eslesmeler_tohumlar:
        _, tohumlar = eslesmeler_tohumlar[0]
        tohum_listesi = [kelime.strip() for kelime in re.findall(r'\b\w+\b', tohumlar)]
        sonuc_tohumlar = f"{kullanici_ay.capitalize()} ayında tohum ekimi yapılacak tohumlar: {', '.join(tohum_listesi)}"

    return sonuc_bitkiler, sonuc_tohumlar

def cevap_hazirla(kullanici_ay, kullanici_toprak):
    url = 'https://www.sabah.com.tr/tarim/bitkiler/hangi-ayda-ne-ekilir-iklim-sartlari-ve-mevsime-gore-ekilecek-sebze-ve-meyveler-5847523'
    metin_icerigi = veri_topla(url)

    pdf_url = 'https://fbabd.amasya.edu.tr/media/1104/topluma-hizuygulamas%C4%B1.pdf'
    pdf_metni = pdf_metni_cek(pdf_url)
    metin = pdf_metni
    duz_metin = metin.replace('\n', ' ')
    sonuc_bitkiler, sonuc_tohumlar = hangi_bitkiler_ve_tohumlar_ne_zaman(metin_icerigi, kullanici_ay)
    turkish_stopwords = set(stopwords.words('turkish'))

    # Noktalama işaretlerini çıkarmak için desen
    noktalama_deseni = re.compile(r'[^\w\s]')

    # "TINLI TOPRAK" ve "gibi" ifadeleri arasındaki cümle deseni
    desen = re.compile(r'TINLI TOPRAK(.+?)gibi', re.DOTALL | re.IGNORECASE)

    # Tınlı toprak bitkilerini saklamak için liste
    tinli_toprak_bitkileri = []

    # Metindeki her bir eşleşen ifade için döngü
    for eslesme in desen.finditer(duz_metin):
        arasindaki_cumle = eslesme.group(1).strip()

        # Noktalama işaretlerini çıkar
        arasindaki_cumle = noktalama_deseni.sub('', arasindaki_cumle)

        # Kelimeleri ayır, küçük harfe çevir ve stopwords'leri filtrele
        kelimeler = [kelime.lower() for kelime in arasindaki_cumle.split() if kelime.lower() not in turkish_stopwords]

        tinli_toprak_bitkileri.extend(kelimeler)
    turkish_stopwords = set(stopwords.words('turkish'))

    # Noktalama işaretlerini çıkarmak için desen
    noktalama_deseni = re.compile(r'[^\w\s]')

    # "KUMLU TOPRAK" ve "pancarı" ifadeleri arasındaki cümle deseni
    desen = re.compile(r'KUMLU TOPRAK(.+?)pancarı', re.DOTALL | re.IGNORECASE)

    # Kumlu toprak bitkileri saklamak için liste
    kumlu_toprak_bitkileri = []

    # Metindeki her bir eşleşen ifade için döngü
    for eslesme in desen.finditer(duz_metin):
        arasindaki_cumle = eslesme.group(1).strip()

        # Noktalama işaretlerini çıkar
        arasindaki_cumle = noktalama_deseni.sub('', arasindaki_cumle)

        # Kelimeleri ayır, küçük harfe çevir ve stopwords'leri filtrele
        kelimeler = [kelime.lower() for kelime in arasindaki_cumle.split() if kelime.lower() not in turkish_stopwords]
        
        kumlu_toprak_bitkileri.extend(kelimeler)
    turkish_stopwords = set(stopwords.words('turkish'))

    # Noktalama işaretlerini çıkarmak için desen    
    noktalama_deseni = re.compile(r'[^\w\s]')

    # "TAŞLI TOPRAK" ve "ve gibi" ifadeleri arasındaki cümle deseni
    desen = re.compile(r'TAŞLI TOPRAK(.+?)bitkileri', re.DOTALL | re.IGNORECASE)

    # Taşlı toprak bitkileri saklamak için liste
    tasli_toprak_bitkileri = []

    # Metindeki her bir eşleşen ifade için döngü
    for eslesme in desen.finditer(duz_metin):
        arasindaki_cumle = eslesme.group(1).strip()

        # Noktalama işaretlerini çıkar
        arasindaki_cumle = noktalama_deseni.sub('', arasindaki_cumle)

        # Kelimeleri ayır, küçük harfe çevir ve stopwords'leri filtrele
        kelimeler = [kelime.lower() for kelime in arasindaki_cumle.split() if kelime.lower() not in turkish_stopwords]
        
        tasli_toprak_bitkileri.extend(kelimeler)    
    turkish_stopwords = set(stopwords.words('turkish'))

    # Noktalama işaretlerini çıkarmak için desen
    noktalama_deseni = re.compile(r'[^\w\s]')

    # "KİLLİ TOPRAK" ve "tütün" ifadeleri arasındaki cümle deseni
    desen = re.compile(r'KİLLİ TOPRAK(.+?)tütün', re.DOTALL | re.IGNORECASE)

    # Killi toprak bitkileri saklamak için liste
    killi_toprak_bitkileri = []

    # Metindeki her bir eşleşen ifade için döngü
    for eslesme in desen.finditer(duz_metin):
        arasindaki_cumle = eslesme.group(1).strip()

        # Noktalama işaretlerini çıkar
        arasindaki_cumle = noktalama_deseni.sub('', arasindaki_cumle)

        # Kelimeleri ayır, küçük harfe çevir ve stopwords'leri filtrele
        kelimeler = [kelime.lower() for kelime in arasindaki_cumle.split() if kelime.lower() not in turkish_stopwords]
        
        killi_toprak_bitkileri.extend(kelimeler)
    turkish_stopwords = set(stopwords.words('turkish'))

    # Noktalama işaretlerini çıkarmak için desen
    noktalama_deseni = re.compile(r'[^\w\s]')

    # "KİREÇLİ TOPRAK" ve "armut" ifadeleri arasındaki cümle deseni
    desen = re.compile(r'KİREÇLİ TOPRAK(.+?)tütün', re.DOTALL | re.IGNORECASE)

    # Kireçli toprak bitkileri saklamak için liste
    kirecli_toprak_bitkileri = []

    # Metindeki her bir eşleşen ifade için döngü
    for eslesme in desen.finditer(metin):
        arasindaki_cumle = eslesme.group(1).strip()

        # Noktalama işaretlerini çıkar
        arasindaki_cumle = noktalama_deseni.sub('', arasindaki_cumle)

        # Kelimeleri ayır, küçük harfe çevir ve stopwords'leri filtrele
        kelimeler = [kelime.lower() for kelime in arasindaki_cumle.split() if kelime.lower() not in turkish_stopwords]
        
        kirecli_toprak_bitkileri.extend(kelimeler)            
    toprak_bitki_listeleri = {
        "tinli": tinli_toprak_bitkileri,
        "kumlu": kumlu_toprak_bitkileri,
        "tasli": tasli_toprak_bitkileri,
        "killi": killi_toprak_bitkileri,
        "kirecli": kirecli_toprak_bitkileri
    }


    # Kullanıcının girdiği ay
    # kullanici_ay = input("Hangi ayda bitki ve tohum ekimiyle ilgili bilgi almak istiyorsunuz? ")

    # Hangi bitkilerin ve tohumların hangi ayda ekilebileceğini bul
    sonuc_bitkiler, sonuc_tohumlar = hangi_bitkiler_ve_tohumlar_ne_zaman(metin_icerigi, kullanici_ay)


    # Virgülle ayrılmış öğeleri liste haline getir
    sonuc_bitkiler_liste = [kelime.strip() for kelime in sonuc_bitkiler.lower().split(',')]


    # Listeyi ekrana yazdır
    #print(sonuc_bitkiler_liste)
    #print(sonuc_tohumlar)

    # Kullanıcıdan toprak türü bilgisini al
    # kullanici_toprak = input("Hangi toprak türünde bitki ekimi yapmak istiyorsunuz? ")

    # Seçilen toprak türüne göre toprak_bitki_listeleri içindeki listeyi al
    secilen_toprak_listesi = toprak_bitki_listeleri.get(kullanici_toprak.lower(), [])

    # Ortak elemanları bulmak için set kullanılıyor
    ortak_elemanlar = set(sonuc_bitkiler) & set(secilen_toprak_listesi)

    # print(secilen_toprak_listesi)

    # Listelerdeki kelimeleri küçük harfe çevirerek karşılaştırma yapalım
    secilen_toprak_set = set(x.lower() for x in secilen_toprak_listesi)
    sonuc_bitkiler_set = set(x.lower() for x in sonuc_bitkiler_liste)
    tohum_set = set(x.lower() for x in sonuc_tohumlar)

    # Ortak elemanları bulalım
    ortak_kelimeler1 = secilen_toprak_set.intersection(tohum_set)
    ortak_kelimeler = secilen_toprak_set.intersection(sonuc_bitkiler_set)

    # Eğer ortak kelime varsa ekrana yazdıralım
    if ortak_kelimeler:
        print("Ortak Bitkiler/Tohumlar:")
        for kelime in ortak_kelimeler:
            print(kelime)
    else:
        print("Ortak tohum/bitki bulunamadı.")

    cevap = {
        'sonuc_bitkiler': list(ortak_kelimeler),
        'sonuc_tohumlar': list(ortak_kelimeler1)
    }

    return jsonify(cevap)

@app.route('/bitkiler_ve_tohumlar', methods=['POST'])
def bitkiler_ve_tohumlar():
    try:
        kullanici_ay = request.json['kullanici_ay']
        kullanici_toprak = request.json['kullanici_toprak']
        return cevap_hazirla(kullanici_ay, kullanici_toprak)
    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run(debug=True)
