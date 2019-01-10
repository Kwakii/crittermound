import {createLocalVue, shallowMount} from "@vue/test-utils";
import BootstrapVue from "bootstrap-vue";
import Vuex from "vuex";
import Soldiers from '../../../src/components/Soldiers';

const localVue = createLocalVue();
localVue.use(BootstrapVue);
localVue.use(Vuex);

describe('The Soldier View', () => {
  it('should show nations if not at war', () => {
    const store = new Vuex.Store({
      getters: {
        atWar: () => false
      }
    });

    const soldierWrapper = shallowMount(Soldiers, {store, localVue});

    expect(soldierWrapper.find('#nations').exists()).to.be.true;
    expect(soldierWrapper.find('#war').exists()).to.be.false;
  });

  it('should show war if at war', () => {
    const store = new Vuex.Store({
      getters: {
        atWar: () => true
      }
    });

    const soldierWrapper = shallowMount(Soldiers, {store, localVue});

    expect(soldierWrapper.find('#war').exists()).to.be.true;
    expect(soldierWrapper.find('#nations').exists()).to.be.false;
  });
});