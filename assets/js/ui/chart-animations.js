export function createChartAnimations(){
  const ease = ".16 1 .3 1";
  let barClipId = 0;
  let barFrame = 0;
  let lineClipId = 0;
  let lineFrame = 0;

  function barGrowTiming(delay = 0){
    return `data-bar-animate="true" dur="1.2s" begin="${Math.max(0, delay)}ms" fill="freeze" calcMode="spline" keyTimes="0;1" keySplines="${ease}"`;
  }

  function lineGrowTiming(delay = 0){
    return `data-line-animate="true" dur="1.8s" begin="${Math.max(0, delay)}ms" fill="freeze" calcMode="spline" keyTimes="0;1" keySplines="${ease}"`;
  }

  function restartBarAnimations(root = document){
    cancelAnimationFrame(barFrame);
    barFrame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        root.querySelectorAll("animate[data-bar-animate]").forEach(animation => {
          if(typeof animation.beginElement === "function"){
            try { animation.beginElement(); } catch(error) {}
          }
        });
        root.querySelectorAll(".ex-bar-fill").forEach(element => {
          element.style.animation = "none";
          void element.offsetWidth;
          element.style.animation = "";
        });
      });
    });
  }

  function restartLineAnimations(root = document){
    cancelAnimationFrame(lineFrame);
    lineFrame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        root.querySelectorAll("animate[data-line-animate]").forEach(animation => {
          if(typeof animation.beginElement === "function"){
            try { animation.beginElement(); } catch(error) {}
          }
        });
      });
    });
  }

  function svgAnimatedLinePath(path, attrs = "", delay = 0){
    return `<path d="${path}" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" ${attrs}><animate attributeName="stroke-dashoffset" from="1" to="0" ${lineGrowTiming(delay)}/></path>`;
  }

  function svgLeftRevealPath(path, x, y, width, height, fill, attrs = "", delay = 0){
    const id = `lineRevealClip_${lineClipId++}`;
    return `<defs><clipPath id="${id}"><rect x="${x}" y="${y}" width="0" height="${height}"><animate attributeName="width" from="0" to="${width}" ${lineGrowTiming(delay)}/></rect></clipPath></defs><path d="${path}" fill="${fill}" clip-path="url(#${id})" ${attrs}/>`;
  }

  function svgHorizontalBar(x, y, width, height, radius, fill, attrs = "", delay = 0){
    return `<rect x="${x}" y="${y}" width="0" height="${height}" rx="${radius}" fill="${fill}" ${attrs}><animate attributeName="width" from="0" to="${width}" ${barGrowTiming(delay)}/></rect>`;
  }

  function svgVerticalBar(x, y, width, height, radius, fill, attrs = "", delay = 0){
    const base = y + height;
    return `<rect x="${x}" y="${base}" width="${width}" height="0" rx="${radius}" fill="${fill}" ${attrs}><animate attributeName="y" from="${base}" to="${y}" ${barGrowTiming(delay)}/><animate attributeName="height" from="0" to="${height}" ${barGrowTiming(delay)}/></rect>`;
  }

  function svgClippedVerticalPath(path, x, y, width, height, base, fill, attrs = "", delay = 0){
    const id = `barGrowClip_${barClipId++}`;
    return `<defs><clipPath id="${id}"><rect x="${x}" y="${base}" width="${width}" height="0"><animate attributeName="y" from="${base}" to="${y}" ${barGrowTiming(delay)}/><animate attributeName="height" from="0" to="${height}" ${barGrowTiming(delay)}/></rect></clipPath></defs><path d="${path}" fill="${fill}" clip-path="url(#${id})" ${attrs}/>`;
  }

  return { restartBarAnimations, restartLineAnimations, svgAnimatedLinePath, svgLeftRevealPath, svgHorizontalBar, svgVerticalBar, svgClippedVerticalPath };
}
