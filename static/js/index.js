/**
 * MMFormalizer - index.js 
 * 终极修复版：解决切换 Topic 后轮播图由于宽度为 0 导致的不显示问题
 */

window.HELP_IMPROVE_VIDEOJS = false;

var INTERP_BASE = "./static/interpolation/stacked";
var NUM_INTERP_FRAMES = 240;
var interp_images = [];

// 预加载插值图像逻辑 (只有路径正确时才建议开启)
function preloadInterpolationImages() {
  for (var i = 0; i < NUM_INTERP_FRAMES; i++) {
    var path = INTERP_BASE + '/' + String(i).padStart(6, '0') + '.jpg';
    interp_images[i] = new Image();
    interp_images[i].src = path;
  }
}

function setInterpolationImage(i) {
  var image = interp_images[i];
  if(!image) return;
  image.ondragstart = function() { return false; };
  image.oncontextmenu = function() { return false; };
  $('#interpolation-image-wrapper').empty().append(image);
}

$(document).ready(function() {
    // 1. Navbar 手机端菜单逻辑
    $(".navbar-burger").click(function() {
      $(".navbar-burger").toggleClass("is-active");
      $(".navbar-menu").toggleClass("is-active");
    });

    // 2. 初始化轮播图，并将实例存入数组
    var carouselInstances = [];
    $('.results-carousel').each(function() {
        var $this = $(this);
        var itemCount = $this.find('.item').length;

        var instances = bulmaCarousel.attach(this, {
            slidesToScroll: 1,
            slidesToShow: 1,
            loop: itemCount > 1,      // 只有多于一张图才开启循环，防止插件崩溃
            infinite: itemCount > 1,
            autoplay: false,
            pagination: true
        });

        // 收集所有实例以便后续调用 reset()
        if (instances && instances.length > 0) {
            carouselInstances.push(instances[0]);
        }
    });

    // 3. 核心切换逻辑：使用委托监听确保 100% 捕获点击
    $(document).on('click', '#case-study-tabs li', function(e) {
        e.preventDefault();
        var topic = $(this).data('topic');
        console.log("Tab Clicked! Switching to topic:", topic);

        if (!topic) return;

        // A. 切换 Tab 按钮高亮样式
        $('#case-study-tabs li').removeClass('is-active');
        $(this).addClass('is-active');

        // B. 切换内容容器显隐
        // 确保你的 HTML 里 Newton/Thermo/Maxwell 的容器类名都有 case-carousel-group
        $('.case-carousel-group').addClass('is-hidden');
        var $target = $('#' + topic + '-carousel');
        $target.removeClass('is-hidden');

        // C. 【关键修复】延迟唤醒轮播图
        // 延迟 150ms 确保浏览器已经完成了 CSS 显隐切换（display: none -> block）
        setTimeout(function() {
            // 触发全局 resize 事件，让插件尝试重绘
            window.dispatchEvent(new Event('resize'));

            // 强力唤醒：针对当前显示的那个实例，执行一次 reset()
            if (carouselInstances) {
                carouselInstances.forEach(function(instance) {
                    // 检查实例对应的 DOM 元素 ID 是否匹配
                    if (instance.element && instance.element.id === topic + '-carousel') {
                        console.log("Resetting carousel for:", topic);
                        instance.reset(); // 强制插件重新数一遍宽度
                    }
                });
            }
        }, 150);
    });

    // 4. 初始化其他原有功能
    // 如果你的图片文件夹 404，请保持下面这一行注释掉
    // preloadInterpolationImages();

    $('#interpolation-slider').on('input', function(event) {
      setInterpolationImage(this.value);
    });
    setInterpolationImage(0);
    $('#interpolation-slider').prop('max', NUM_INTERP_FRAMES - 1);

    if (typeof bulmaSlider !== 'undefined') {
        bulmaSlider.attach();
    }
});