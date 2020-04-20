import { throttle, forEachRight } from 'lodash-es'

export function sectionsGroups () {
  let groups = []

  function getGroups () {
    const CONTAINER = !!document.getElementById('artboard') ?
      document.getElementById('artboard') : document.querySelector('.main')

    if (CONTAINER === null) {
      return false
    }

    const SECTIONS = Array.from(CONTAINER.children)
    groups = []

    SECTIONS.forEach((section, index) => {
      if (section.classList.contains('ptah-g-main')) {
        let group = {}
        group.main = section
        group.children = SECTIONS.slice(index + 1, index + parseInt(section.dataset.absorb, 10) + 1)

        groups.push(group)
      }
    })

    calculate(groups)
  }

  function calculate (groups) {
    groups.forEach((group) => {
      let padding = group.children.reduce((sum, el) => sum + el.offsetHeight, 0)
      group.main.style.paddingBottom = padding + 'px'

      let offset = 0

      forEachRight(group.children, (el, i) => {
        let height = el.offsetHeight
        let style = el.style

        if (groups.length - 1 !== i) {
          style.paddingBottom = `${offset}px`
        }

        offset = offset + height

        style.position = 'relative'
        style.marginTop = `-${offset}px`
      })
    })
  }

  window.addEventListener('resize', throttle(getGroups, 1000))

  getGroups()
}


sectionsGroups()
