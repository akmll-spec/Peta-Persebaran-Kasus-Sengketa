/**
 * Fix untuk mengatasi HTTP/2 Protocol Error dan Undefined JSON variables
 * - Retry mechanism untuk data loading yang gagal
 * - Graceful fallback jika data tidak tersedia
 */

(function() {
    'use strict';
    
    const dataFiles = [
        'data/K2_9.js',
        'data/K1_10.js',
        'data/TAHUNSELESAI2026_11.js',
        'data/SELESAI_12.js',
        'data/PROSES_13.js',
        'data/JUMLAH_14.js',
        'data/SertifikatElektronik_15.js',
        'data/SertifikatAnalog_16.js',
        'data/TidakTerdaftar_17.js',
        'data/HPL_18.js',
        'data/Wakaf_19.js',
        'data/HP_20.js',
        'data/HGU_21.js',
        'data/HGB_22.js',
        'data/HMSarusun_23.js',
        'data/HM_24.js',
        'data/TipologiLain_25.js',
        'data/Informasidantransaksielektronik_26.js',
        'data/Pelaksanaanputusanpengadilan_27.js',
        'data/PengadaanTanah_28.js',
        'data/TanahUlayattanahulayat_29.js',
        'data/TanahObjekLandReform_30.js',
        'data/Pemeliharaandatapendaftarantanah_31.js',
        'data/Penetapanhakdanpendaftarantanah_32.js',
        'data/Penggunaandanpemanfaatantanah_33.js',
        'data/PenguasaandanPemilikan_34.js',
        'data/Letakdanbatasbidangtanah_35.js',
        'data/BERAT_36.js',
        'data/SEDANG_37.js',
        'data/RINGAN_38.js',
        'data/TARGETDIPA_39.js',
        'data/RUTIN_40.js',
        'data/TotalMasuk_41.js',
        'data/2026_42.js',
        'data/2025_43.js',
        'data/SatuanKerja_44.js'
    ];

    // Mapping nama file ke nama variabel global
    const fileToVarMap = {
        'data/K2_9.js': 'json_K2_9',
        'data/K1_10.js': 'json_K1_10',
        'data/TAHUNSELESAI2026_11.js': 'json_TAHUNSELESAI2026_11',
        'data/SELESAI_12.js': 'json_SELESAI_12',
        'data/PROSES_13.js': 'json_PROSES_13',
        'data/JUMLAH_14.js': 'json_JUMLAH_14',
        'data/SertifikatElektronik_15.js': 'json_SertifikatElektronik_15',
        'data/SertifikatAnalog_16.js': 'json_SertifikatAnalog_16',
        'data/TidakTerdaftar_17.js': 'json_TidakTerdaftar_17',
        'data/HPL_18.js': 'json_HPL_18',
        'data/Wakaf_19.js': 'json_Wakaf_19',
        'data/HP_20.js': 'json_HP_20',
        'data/HGU_21.js': 'json_HGU_21',
        'data/HGB_22.js': 'json_HGB_22',
        'data/HMSarusun_23.js': 'json_HMSarusun_23',
        'data/HM_24.js': 'json_HM_24',
        'data/TipologiLain_25.js': 'json_TipologiLain_25',
        'data/Informasidantransaksielektronik_26.js': 'json_Informasidantransaksielektronik_26',
        'data/Pelaksanaanputusanpengadilan_27.js': 'json_Pelaksanaanputusanpengadilan_27',
        'data/PengadaanTanah_28.js': 'json_PengadaanTanah_28',
        'data/TanahUlayattanahulayat_29.js': 'json_TanahUlayattanahulayat_29',
        'data/TanahObjekLandReform_30.js': 'json_TanahObjekLandReform_30',
        'data/Pemeliharaandatapendaftarantanah_31.js': 'json_Pemeliharaandatapendaftarantanah_31',
        'data/Penetapanhakdanpendaftarantanah_32.js': 'json_Penetapanhakdanpendaftarantanah_32',
        'data/Penggunaandanpemanfaatantanah_33.js': 'json_Penggunaandanpemanfaatantanah_33',
        'data/PenguasaandanPemilikan_34.js': 'json_PenguasaandanPemilikan_34',
        'data/Letakdanbatasbidangtanah_35.js': 'json_Letakdanbatasbidangtanah_35',
        'data/BERAT_36.js': 'json_BERAT_36',
        'data/SEDANG_37.js': 'json_SEDANG_37',
        'data/RINGAN_38.js': 'json_RINGAN_38',
        'data/TARGETDIPA_39.js': 'json_TARGETDIPA_39',
        'data/RUTIN_40.js': 'json_RUTIN_40',
        'data/TotalMasuk_41.js': 'json_TotalMasuk_41',
        'data/2026_42.js': 'json_2026_42',
        'data/2025_43.js': 'json_2025_43',
        'data/SatuanKerja_44.js': 'json_SatuanKerja_44'
    };

    // Fallback empty GeoJSON untuk semua layer yang gagal
    const emptyGeoJSON = {
        type: 'FeatureCollection',
        features: []
    };

    // Function untuk load file dengan retry
    function loadDataWithRetry(filePath, varName, maxRetries = 3) {
        return new Promise((resolve) => {
            let attempts = 0;

            function attempt() {
                attempts++;
                
                const script = document.createElement('script');
                script.src = filePath + '?v=' + Date.now(); // Cache bust
                script.async = true;

                script.onload = function() {
                    // Check apakah variabel berhasil terdefinisi
                    if (window[varName] && typeof window[varName] === 'object') {
                        console.log('✅ Berhasil load:', filePath);
                        resolve({ success: true, variable: window[varName] });
                    } else {
                        console.warn('⚠️ Variable tidak terdefinisi setelah load:', varName);
                        if (attempts < maxRetries) {
                            setTimeout(attempt, 500 * attempts); // Exponential backoff
                        } else {
                            // Fallback: assign empty GeoJSON
                            window[varName] = emptyGeoJSON;
                            console.warn('📭 Using fallback empty GeoJSON untuk:', varName);
                            resolve({ success: false, variable: emptyGeoJSON });
                        }
                    }
                };

                script.onerror = function() {
                    console.error('❌ Gagal load:', filePath);
                    if (attempts < maxRetries) {
                        setTimeout(attempt, 500 * attempts);
                    } else {
                        // Fallback: assign empty GeoJSON
                        window[varName] = emptyGeoJSON;
                        console.warn('📭 Using fallback empty GeoJSON untuk:', varName);
                        resolve({ success: false, variable: emptyGeoJSON });
                    }
                };

                document.head.appendChild(script);
            }

            attempt();
        });
    }

    // Load semua data files secara parallel dengan timeout
    async function preloadAllData() {
        console.log('🔄 Mulai pre-load data files...');
        
        const promises = dataFiles.map(file => {
            const varName = fileToVarMap[file];
            return loadDataWithRetry(file, varName);
        });

        // Wait all atau timeout 30 detik
        try {
            await Promise.race([
                Promise.all(promises),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Data loading timeout')), 30000)
                )
            ]);
            console.log('✅ Semua data berhasil di-load atau fallback sudah disiapkan');
        } catch (error) {
            console.warn('⚠️ Timeout loading data, lanjutkan dengan fallback:', error);
        }
    }

    // Global error handler untuk undefined variables
    window.addEventListener('error', function(e) {
        if (e.message && e.message.includes('is not defined')) {
            console.warn('⚠️ Tangkap error undefined variable:', e.message);
            // Extract nama variable dari error message
            const match = e.message.match(/(\w+) is not defined/);
            if (match) {
                const varName = match[1];
                if (varName.startsWith('json_')) {
                    window[varName] = emptyGeoJSON;
                    console.log('�� Assign fallback untuk:', varName);
                }
            }
        }
    }, true);

    // Start preloading saat document ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', preloadAllData);
    } else {
        preloadAllData();
    }

})();
