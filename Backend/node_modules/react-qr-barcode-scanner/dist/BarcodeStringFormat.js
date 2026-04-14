/**
 * Enumerates barcode formats known to this package as strings. These need to be the same as BarcodeFormat from "@zing/library".
 */
export var BarcodeStringFormat;
(function (BarcodeStringFormat) {
    /** Aztec 2D barcode format. */
    BarcodeStringFormat["AZTEC"] = "AZTEC";
    /** CODABAR 1D format. */
    BarcodeStringFormat["CODABAR"] = "CODABAR";
    /** Code 39 1D format. */
    BarcodeStringFormat["CODE_39"] = "CODE_39";
    /** Code 93 1D format. */
    BarcodeStringFormat["CODE_93"] = "CODE_93";
    /** Code 128 1D format. */
    BarcodeStringFormat["CODE_128"] = "CODE_128";
    /** Data Matrix 2D barcode format. */
    BarcodeStringFormat["DATA_MATRIX"] = "DATA_MATRIX";
    /** EAN-8 1D format. */
    BarcodeStringFormat["EAN_8"] = "EAN_8";
    /** EAN-13 1D format. */
    BarcodeStringFormat["EAN_13"] = "EAN_13";
    /** ITF (Interleaved Two of Five) 1D format. */
    BarcodeStringFormat["ITF"] = "ITF";
    /** MaxiCode 2D barcode format. */
    BarcodeStringFormat["MAXICODE"] = "MAXICODE";
    /** PDF417 format. */
    BarcodeStringFormat["PDF_417"] = "PDF_417";
    /** QR Code 2D barcode format. */
    BarcodeStringFormat["QR_CODE"] = "QR_CODE";
    /** RSS 14 */
    BarcodeStringFormat["RSS_14"] = "RSS_14";
    /** RSS EXPANDED */
    BarcodeStringFormat["RSS_EXPANDED"] = "RSS_EXPANDED";
    /** UPC-A 1D format. */
    BarcodeStringFormat["UPC_A"] = "UPC_A";
    /** UPC-E 1D format. */
    BarcodeStringFormat["UPC_E"] = "UPC_E";
    /** UPC/EAN extension format. Not a stand-alone format. */
    BarcodeStringFormat["UPC_EAN_EXTENSION"] = "UPC_EAN_EXTENSION";
})(BarcodeStringFormat || (BarcodeStringFormat = {}));
export default BarcodeStringFormat;
