/* Download an img */
function download(img) {
    var link = document.createElement("a");
    link.href = img.src;
    link.download = true;
    link.style.display = "none";
    var evt = new MouseEvent("click", {
        "view": window,
        "bubbles": true,
        "cancelable": true
    });

    document.body.appendChild(link);
    link.dispatchEvent(evt);
    document.body.removeChild(link);
    console.log("Downloading...");
}

/* Download all images in 'imgs'.
 * Optionaly filter them by extension (e.g. "jpg") and/or
 * download the 'limit' first only  */
function downloadAll(imgs, ext, limit) {
    /* If specified, filter images by extension */
    if (ext) {
        ext = "." + ext;
        imgs = [].slice.call(imgs).filter(function(img) {
            var src = img.src;
            return (src && (src.indexOf(ext, src.length - ext.length) !== -1));
        });
    }

    /* Determine the number of images to download */
    limit = (limit && (0 <= limit) && (limit <= imgs.length))
        ? limit : imgs.length;

    /* (Try to) download the images */
    for (var i = 0; i < limit; i++) {
        var img = imgs[i];
        console.log("IMG: " + img.src + " (", img, ")");
        download(img);
    }
}


downloadAll(document.getElementsByTagName('img'), 'jpg', 100);
