export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  const test = [...block.querySelectorAll('.columns2 > div')];
  test.forEach(e => {
    // console.log(e);
    
  })
  
}
