<script>
export default {
  name: 'SlideDown',

  props: {
    active: Boolean,
    duration: {
      type: Number,
      default: 500
    },
    tag: {
      type: String,
      default: 'div'
    }
  },

  data: () => ({
    scrollHeight: 0,
    isMounted: false
  }),

  watch: {
    active () {
      this.layout()
    }
  },

  render (h) {
    return h(
      this.tag,
      {
        style: this.style,
        ref: 'container'
      },
      this.$slots.default
    )
  },

  mounted () {
    window.addEventListener('resize', this.layout)

    this.layout()

    this.$nextTick(() => {
      this.isMounted = true
    })
  },

  destroyed () {
    window.removeEventListener('resize', this.layout)
  },

  computed: {
    style () {
      const heightSize = this.active ? this.scrollHeight : 0

      return {
        overflow: 'hidden',
        'transition-property': 'min-height',
        'min-height': this.isMounted ? heightSize + 'px' : 0,
        'height': this.active ? 'auto' : 0,
        'transition-duration': this.duration + 'ms'
      }
    },

    el () {
      return this.$refs.container
    }
  },

  methods: {
    layout () {
      this.scrollHeight = this.el.scrollHeight
    }
  }
}
</script>
