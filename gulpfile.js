const child_process = require("child_process");
const gulp = require('gulp');
const imgmin = require('gulp-imagemin');
const rev = require('gulp-rev');
const webserver = require('gulp-webserver');
const os = require('os'),
    fs = require('fs'),
    ifaces = os.networkInterfaces();
//const del = require('del');

let currIp = "127.0.0.1";

for (const dev in ifaces) {
    let obj = ifaces[dev];
    obj.forEach(item => {
        if (item.family === "IPv4" && item.address.indexOf("10") >= 0) {
            currIp = item.address;
        }
    });
}
fs.writeFileSync("os.json", `{"ip": "${currIp}"}`);

gulp.task('default', ["dist", "watch", "server"]);
gulp.task('run', ["watch", "server"]);

function min_img(file_path, merge = false) {
    gulp.src(file_path)
        .pipe(imgmin())
        .pipe(rev())
        .pipe(gulp.dest("./dist"))
        .pipe(rev.manifest({
            merge: merge
        }))
        .pipe(gulp.dest("./"));
}

gulp.task('dist', function () {
    //del("./dist/");

    min_img("./images/*.{png,jpg,gif,ico}");

});
gulp.task('watch', function () {
    gulp.watch('images/*', function (event) {
        console.log(event.type)
        if (event.type === "added") {
            min_img(event.path, true)
        }
        if (event.type === "changed") {
            min_img(event.path, true)
        }
    });
});
gulp.task('server', function () {
    child_process.exec("node server/index.js");
    console.log("启动web服务:" + currIp);
    // gulp.src('dist')
    //     .pipe(webserver({
    //         host: currIp,
    //         directoryListing: true,
    //         livereload: true,
    //         port: 18097
    //     }));
});

gulp.task('build', function () {

    min_img("./images/*.{png,jpg,gif,ico}");
    let args = process.argv.splice(3);
    if (args.indexOf("-t") >= 0) {
        fs.writeFileSync("os.json", `{"ip": "http://imgbeta.daling.com/bundle_img/"}`);
    } else if (args.indexOf("-rx") >= 0) {
        fs.writeFileSync("os.json", `{"ip": "http://img.daling.com/bundle_rx_img/"}`);
    } else {
        fs.writeFileSync("os.json", `{"ip": "http://img.daling.com/bundle_img/"}`);
    }
});

gulp.task('test', function () {
    child_process.exec("node server/index.js");
});