import { shallowMount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import Achievement from '../../../src/components/Achievement';
import BootstrapVue from "bootstrap-vue";
import AchievementHandler from '../../../src/lib/Achievement';

const localVue = createLocalVue()
localVue.use(BootstrapVue);
localVue.use(Vuex)

describe('The Achievement view', () => {
  it('should show all achievements', () => {
    const allAchievements = AchievementHandler.allAchievements();
    const firstAchievement = allAchievements[0];

    const store = new Vuex.Store({
      state: {},
      getters: {
        unlockedAchievements: () => []
      },
      actions: {}
    });
    const achievementWrapper = shallowMount(Achievement, {store, localVue});

    const expectedText = `${firstAchievement.name} ${firstAchievement.description}`
    expect(achievementWrapper.vm.$children[0].$el.innerText).to.equal(expectedText);
    expect(achievementWrapper.vm.$children.length).to.equal(allAchievements.length)
  });

  it('should mark unlocked achievements', () => {
    const store = new Vuex.Store({
      state: {},
      getters: {
        unlockedAchievements: () => [1, 0]
      },
      actions: {}
    });
    const achievementWrapper = shallowMount(Achievement, {store, localVue});

    expect(achievementWrapper.vm.$children[0].$el.getAttribute('variant')).to.equal('info');
    expect(achievementWrapper.vm.$children[1].$el.getAttribute('variant')).to.equal('light');
  })
});
