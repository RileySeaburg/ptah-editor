<script>
import * as _ from 'lodash-es'
import { mapState, mapActions } from 'vuex'
import { getYoutubeVideoIdFromUrl, isValidUrl } from '@editor/util'

export default {
  name: 'TheModalButton',

  props: {
    builder: Object
  },

  data () {
    return {
      link: '',
      behavior: '',
      target: false,
      videoId: '',
      actionList: [
        { name: 'Open URL', value: '' },
        { name: 'Open video popup', value: 'ptah-d-video' },
        { name: 'Scroll into section', value: 'scroll-into-section' }
      ],
      action: { name: 'Open URL', value: '' },
      section: { name: 'Select section', value: '' },
      scrollBehaviors: [
        { name: 'Auto', value: 'auto' },
        { name: 'Instant', value: 'instant' },
        { name: 'Smooth', value: 'smooth' }
      ],
      scrollBehavior: { name: 'Auto', value: 'auto' },
      error: {
        url: false
      }
    }
  },

  computed: {
    ...mapState('Sidebar', [
      'settingObjectOptions',
      'settingObjectSection'
    ]),

    sections () {
      let currentSectionId = this.settingObjectSection.id
      return this.builder.sections
        .filter(({ id }) => id !== currentSectionId)
        .map(({ id, name }) => ({ name: name, value: `#section_${id}` }))
    },

    elLink () {
      return this.settingObjectOptions.link
    },

    classes: {
      get: function () {
        return this.settingObjectOptions.classes
      },
      set: function (newValue) {
        this.updateSettingOptions(_.merge({}, this.settingObjectOptions, { classes: newValue }))
      }
    },

    videoLink: {
      get: function () {
        return this.settingObjectOptions.video
      },
      set: function (newValue) {
        this.updateSettingOptions(_.merge({}, this.settingObjectOptions, { video: newValue }))
      }
    }
  },

  created () {
    if (this.elLink) {
      this.link = this.elLink.href
      this.behavior = this.elLink.behavior
      this.target = this.elLink.target === '_blank'
      this.action = this.elLink.action
    }

    this.videoId = this.videoLink || ''

    if (this.action === '') {
      this.action = { name: 'Open URL', value: '' }
    }

    if (this.action === 'ptah-d-video') {
      this.action = { name: 'Open video popup', value: 'ptah-d-video' }
    }

    if (this.action === 'scroll-into-section') {
      let matches = this.link.match(/\d+(?!\d+)/)
      if (matches) {
        let id = Number(matches[0])
        let section = this.builder.sections.find(section => section.id === id)
        this.section = (section) ? { name: section.name, value: this.link } : { name: 'Select section', value: '' }
      }
      this.action = { name: 'Scroll into section', value: 'scroll-into-section' }
      this.scrollBehavior = this.scrollBehaviors.find(({ value }) => value === this.behavior) || this.scrollBehaviors[0]
    }
  },

  methods: {
    ...mapActions('Sidebar', [
      'updateSettingOptions'
    ]),

    setUrl (link) {
      this.updateSettingOptions(_.merge({}, this.settingObjectOptions, { link }))
    },

    validUrl (url) {
      let v = true
      let link = {}

      if (url !== '') {
        v = isValidUrl(url)
      }

      this.error.url = !v

      if (v === false) {
        return
      }

      link['href'] = url
      this.setUrl(link)
    },

    changeTarget () {
      this.elLink['target'] = this.target === true ? '_blank' : '_self'
    },

    setVideoUrl () {
      let ytId = getYoutubeVideoIdFromUrl(this.videoId)

      if (ytId) {
        this.videoLink = ytId
        this.$emit('changeProps', { video: ytId })
      }
    },

    changeAction () {
      if (this.action.value === '') {
        this.link = (this.link.includes('#section_')) ? '' : this.link.href
        this.setUrl(this.link)

        this.classes.push('js-element-link')
      } else {
        _.remove(this.classes, (n) => n === 'js-element-link')
      }

      if (this.action.value !== 'ptah-d-video') {
        _.remove(this.classes, (n) => n === 'ptah-d-video')
      } else {
        this.classes.push('ptah-d-video')
      }

      this.elLink['action'] = this.action.value
    },

    changeScrollIntoSection ({ value }) {
      this.updateSettingOptions(
        _.merge({}, this.settingObjectOptions, {
          link: { href: value, target: '_self' }
        })
      )
    },

    changeScrollBehavior () {
      this.elLink['behavior'] = this.scrollBehavior.value
      this.$emit('changeProps', { behavior: this.scrollBehavior.value })
    }
  }
}
</script>

<template>
  <div class="b-link-controls">

    <!-- action -->
    <div class="b-link-controls__control">
      <base-select label="Action" :options="actionList" v-model="action" @input="changeAction(action)"></base-select>
    </div>

    <!-- scroll into section -->
    <div v-if="action.value === 'scroll-into-section' && sections.length > 0" class="b-link-controls__control">
      <base-select
        v-model="section"
        :options="sections"
        @input="changeScrollIntoSection"
        label="Scroll to"/>
      <br>
      <base-select
        v-model="scrollBehavior"
        :options="scrollBehaviors"
        @input="changeScrollBehavior"
        label="Scroll behavior"/>
    </div>

    <div class="b-link-controls__no-sections" v-if="action.value === 'scroll-into-section' && sections.length === 0">
      No more sections
    </div>

    <!-- open link -->
    <div class="b-link-controls__control" v-if="action.value === ''">
      <base-text-field v-model="link" label="URL" placeholder="https://www.url.com" :hasError="error.url" @input="validUrl(link)">
        <span slot="error">
          Invalid URL
        </span>
      </base-text-field>
    </div>
    <div class="b-link-controls__control" v-if="action.value === ''">
      <BaseSwitcher v-model="target" label="Open in new window" @change="changeTarget" />
    </div>

    <!-- video popup -->
    <div class="b-link-controls__control" v-if="action.value === 'ptah-d-video'">
      <base-text-field v-model="videoId" label="Video" @input="setVideoUrl" placeholder="Youtube video url"></base-text-field>
    </div>

  </div>
</template>

<style lang="sass" scoped>
@import '../../../assets/sass/_colors.sass'
@import '../../../assets/sass/_variables.sass'

.b-link-controls
  &__control
    margin-top: $size-step/1.45
  &__no-sections
    padding: $size-step
    text-align: center
    color: $grey
</style>
