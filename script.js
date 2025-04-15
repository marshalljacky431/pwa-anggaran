// Cek apakah browser mendukung Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('Service Worker terdaftar dengan sukses:', registration);
      })
      .catch((error) => {
        console.log('Pendaftaran Service Worker gagal:', error);
      });
  });
}

// Data pagu tetap per bidang
const paguBidang = {
  Sekretariat: 5000000,
  TPH: 499999500,
  SDM: 3500000,
  Perkebunan: 6000000,
  UPTD: 4500000,
  ALSINTAN: 2500000,
  KETAPANG: 7000000
};

// Format angka ke rupiah
function formatRupiah(angka) {
  return 'Rp ' + Number(angka).toLocaleString('id-ID');
}

// Inisialisasi data
let data = {};

// Fungsi untuk menginisialisasi data jika belum ada di localStorage
function inisialisasiData() {
  const storedData = localStorage.getItem('dataRealisasi');
  if (storedData) {
    data = JSON.parse(storedData);
  } else {
    // Jika tidak ada data, buat data kosong
    data = {
      Sekretariat: { total: 0, perBulan: {} },
      TPH: { total: 0, perBulan: {} },
      SDM: { total: 0, perBulan: {} },
      Perkebunan: { total: 0, perBulan: {} },
      UPTD: { total: 0, perBulan: {} },
      ALSINTAN: { total: 0, perBulan: {} },
      KETAPANG: { total: 0, perBulan: {} }
    };
    localStorage.setItem('dataRealisasi', JSON.stringify(data));
  }
}

// Fungsi untuk menampilkan data realisasi
function tampilkanData() {
  const tabelRealisasi = document.getElementById('tabelRealisasi').getElementsByTagName('tbody')[0];
  tabelRealisasi.innerHTML = ''; // Kosongkan tabel sebelum menambah data
  let totalRealisasi = 0;

  for (let bidang in data) {
    const row = tabelRealisasi.insertRow();
    row.classList.add('total-row'); // Menambahkan kelas untuk baris total
    const cellBidang = row.insertCell(0);
    const cellPagu = row.insertCell(1);
    const cellTotal = row.insertCell(2);
    const cellSisa = row.insertCell(3);
    const cellProgres = row.insertCell(4);

    // Menampilkan data bidang
    cellBidang.innerHTML = bidang;
    cellPagu.innerHTML = formatRupiah(paguBidang[bidang]);
    cellTotal.innerHTML = formatRupiah(data[bidang].total);
    cellSisa.innerHTML = formatRupiah(paguBidang[bidang] - data[bidang].total);
    const progres = ((data[bidang].total / paguBidang[bidang]) * 100).toFixed(2) + '%';
    cellProgres.innerHTML = progres;

    // Menambahkan total realisasi
    totalRealisasi += data[bidang].total;
  }

  // Menampilkan total realisasi di bawah tabel
  const totalRow = tabelRealisasi.insertRow();
  totalRow.classList.add('total-row'); // Menambahkan kelas untuk baris total
  const cellBidangTotal = totalRow.insertCell(0);
  const cellPaguTotal = totalRow.insertCell(1);
  const cellTotalRealisasi = totalRow.insertCell(2);
  const cellSisaTotal = totalRow.insertCell(3);
  const cellProgresTotal = totalRow.insertCell(4);

  cellBidangTotal.innerHTML = '<span class="total">Total</span>';
  cellPaguTotal.innerHTML = '';
  cellTotalRealisasi.innerHTML = `<span class="total">${formatRupiah(totalRealisasi)}</span>`;
  cellSisaTotal.innerHTML = '';  // Kosongkan karena tidak ada nilai sisa total
  cellProgresTotal.innerHTML = '';  // Kosongkan karena tidak ada nilai progres total
}

// Fungsi untuk menampilkan detail per bulan berdasarkan bidang dan bulan yang dipilih
function tampilkanDetailBulanan(bulanFilter = 'All', bidangFilter = 'All') {
  const tabelBulanan = document.getElementById('tabelBulanan').getElementsByTagName('tbody')[0];
  tabelBulanan.innerHTML = ''; // Kosongkan tabel sebelum menambah data
  let totalBulanan = 0;

  for (let bidang in data) {
    if (bidangFilter !== 'All' && bidang !== bidangFilter) continue;

    for (let bulan in data[bidang].perBulan) {
      if (bulanFilter !== 'All' && bulan !== bulanFilter) continue;

      const row = tabelBulanan.insertRow();
      const cellBidang = row.insertCell(0);
      const cellBulan = row.insertCell(1);
      const cellNominal = row.insertCell(2);

      // Menampilkan data per bulan
      cellBidang.innerHTML = bidang;
      cellBulan.innerHTML = bulan;
      cellNominal.innerHTML = formatRupiah(data[bidang].perBulan[bulan]);

      // Menambahkan total bulanan
      totalBulanan += data[bidang].perBulan[bulan];
    }
  }

  // Menampilkan total bulanan di bawah tabel
  const totalRow = tabelBulanan.insertRow();
  totalRow.classList.add('total-row');
  const cellBidangTotal = totalRow.insertCell(0);
  const cellBulanTotal = totalRow.insertCell(1);
  const cellNominalTotal = totalRow.insertCell(2);

  cellBidangTotal.innerHTML = '<span class="total">Total</span>';
  cellBulanTotal.innerHTML = '';
  cellNominalTotal.innerHTML = `<span class="total">${formatRupiah(totalBulanan)}</span>`;
}

// Mengatur event listener untuk form submit
document.getElementById('realisasiForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const bidang = document.getElementById('bidang').value;
  const bulan = document.getElementById('bulan').value;
  const nominal = parseInt(document.getElementById('nominal').value, 10);

  // Menyimpan data
  if (!data[bidang].perBulan[bulan]) {
    data[bidang].perBulan[bulan] = 0;
  }

  data[bidang].perBulan[bulan] += nominal;
  data[bidang].total += nominal;

  // Simpan kembali ke localStorage
  localStorage.setItem('dataRealisasi', JSON.stringify(data));

  // Update tampilan
  tampilkanData();
  tampilkanDetailBulanan();
});

// Mengatur event listener untuk tombol clear data
document.getElementById('clearDataButton').addEventListener('click', function() {
  if (confirm('Apakah Anda yakin ingin menghapus seluruh data?')) {
    localStorage.removeItem('dataRealisasi');
    data = {};
    tampilkanData();
    tampilkanDetailBulanan();
  }
});

// Filter dan tampilkan data berdasarkan filter bulan dan bidang
document.getElementById('filterBulan').addEventListener('change', function() {
  tampilkanDetailBulanan(this.value, document.getElementById('filterBidang').value);
});

document.getElementById('filterBidang').addEventListener('change', function() {
  tampilkanDetailBulanan(document.getElementById('filterBulan').value, this.value);
});

// Inisialisasi data dan tampilkan
inisialisasiData();
tampilkanData();
tampilkanDetailBulanan();
