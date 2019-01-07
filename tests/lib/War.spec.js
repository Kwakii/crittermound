import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import War from '../../src/lib/War';

chai.use(sinonChai);

const expect = chai.expect;

describe('A war', () => {
  it('should have an enemy nation and a map', () => {
    const nation = {id: 12};
    const map = {tiles: []};

    sinon.stub(War.prototype, 'generateMap').returns(map);
    sinon.stub(War.prototype, 'generateBases');
    sinon.stub(War.prototype, 'generateTreasures');
    sinon.stub(War.prototype, 'generateArtifacts');
    const war = new War(nation);


    expect(war.generateMap).to.have.been.called;
    expect(war.generateBases).to.have.been.called;
    expect(war.generateTreasures).to.have.been.called;
    expect(war.generateArtifacts).to.have.been.called;
    expect(war.nation).to.equal(nation);
    expect(war.map).to.equal(map);

    War.prototype.generateMap.restore();
    War.prototype.generateBases.restore();
    War.prototype.generateTreasures.restore();
    War.prototype.generateArtifacts.restore();
  });

  it('should generate a map with set height and width of 20', () => {
    const war = new War({id: 12});

    expect(war.map.tiles.length).to.equal(20);
    expect(war.map.tiles[0].length).to.equal(20);
  });

  it('should get a list of all treasures cloned', () => {
    const allTreasures = War.getAllTreasures();
    expect(allTreasures).not.to.equal(War.getAllTreasures());
    expect(allTreasures[0]).not.to.equal(War.getAllTreasures()[0]);
    expect(allTreasures).to.deep.equal(War.getAllTreasures());
    expect(allTreasures[0]).to.deep.equal(War.getAllTreasures()[0]);
  });

  describe('generating bases', () => {
    let war;
    const x = 2;
    beforeEach(() => {
      war = new War({id: 12});
      sinon.stub(war, 'randomInRange').returns(x);
      sinon.stub(war, 'coinFlip').returns(true);
      sinon.stub(war.map, 'setSpecialTile');
    });

    it('should set one for the critters and enemy', () => {

      war.generateBases();

      expect(war.map.setSpecialTile).to.have.been.calledWith('mound', {x, y:3});
      expect(war.map.setSpecialTile).to.have.been.calledWith('enemy', {x, y:17});
    });

    it('should switch base positions on coin flip', () => {
      war.coinFlip.returns(false);

      war.generateBases();

      expect(war.map.setSpecialTile).to.have.been.calledWith('mound', {x, y:17});
      expect(war.map.setSpecialTile).to.have.been.calledWith('enemy', {x, y:3});
    });

    afterEach(() => {
      war.randomInRange.restore();
      war.coinFlip.restore();
      war.map.setSpecialTile.restore();
    });
  });

  describe('generating treasures', () => {
    const x = 1;
    const y = 4;

    let treasure;
    let war;

    beforeEach(() => {
      treasure = {
        name: 'treasure',
        x: {min: 1, max: 2},
        y: {min: 3, max: 4},
      };
      war = new War({id: 12});
      sinon.stub(War, 'getAllTreasures').returns([treasure]);
      sinon.stub(war, 'randomInRange');
      war.randomInRange.withArgs(treasure.x.min, treasure.x.max).returns(x);
      war.randomInRange.withArgs(treasure.y.min, treasure.y.max).returns(y);
      sinon.stub(war.map, 'setSpecialTile');
      sinon.stub(war.map, 'getTile').returns({isBlocked: () => false});
    });

    it('should set a tile for each treasure', () => {
      const anotherTreasure = {
        name: 'treasure2',
        x: {min: 1, max: 2},
        y: {min: 3, max: 4},
      };

      War.getAllTreasures.returns([treasure, anotherTreasure]);
      war.generateTreasures();

      expect(war.map.setSpecialTile).to.have.been.calledWith(treasure.name, {x, y});
      expect(war.map.setSpecialTile).to.have.been.calledWith(anotherTreasure.name, {x, y});
      expect(war.map.setSpecialTile).to.have.been.calledTwice;
    });

    it('should find a tile that is not blocked to set treasure on', () => {
      const blockedTile = {isBlocked: () => true};
      const freeTile = {isBlocked: () => false};
      const x2 = 2;
      const y2 = 3;

      war.randomInRange.withArgs(treasure.x.min, treasure.x.max).onFirstCall().returns(x);
      war.randomInRange.withArgs(treasure.y.min, treasure.y.max).onFirstCall().returns(y);
      war.randomInRange.withArgs(treasure.x.min, treasure.x.max).onSecondCall().returns(x2);
      war.randomInRange.withArgs(treasure.y.min, treasure.y.max).onSecondCall().returns(y2);
      war.map.getTile.withArgs(x, y).returns(blockedTile);
      war.map.getTile.withArgs(x2, y2).returns(freeTile);

      war.generateTreasures();

      expect(war.map.setSpecialTile).not.to.have.been.calledWith(treasure.name, {x, y});
      expect(war.map.setSpecialTile).to.have.been.calledWith(treasure.name, {x: x2, y: y2});
    });

    afterEach(() => {
      War.getAllTreasures.restore();
      war.randomInRange.restore();
      war.map.setSpecialTile.restore();
      war.map.getTile.restore();
    })
  });

  describe('generating artifacts', () => {
    const x = 2;
    const y = 5;
    let war;

    beforeEach(() => {
      war = new War({id: 12});
      sinon.stub(war, 'randomInRange').returns(0);
      sinon.stub(war.map, 'setSpecialTile');
    });

    it('should generate four artifacts', () => {
      war.randomInRange
        .onFirstCall().returns(x)
        .onSecondCall().returns(y);
      war.generateArtifacts();

      expect(war.randomInRange).to.have.been.called;
      expect(war.randomInRange.callCount).to.equal(8);
      expect(war.map.setSpecialTile).to.have.been.calledWith(sinon.match('artifact'), {x, y});
      expect(war.map.setSpecialTile.callCount).to.equal(4);
    });

    it('should put artifact in specific range', () => {
      war.generateArtifacts();
      expect(war.randomInRange).to.always.have.been.calledWithExactly(0, 19);
    });

    it('should not put artifact if tile is blocked', () => {
      const x1 = 1;
      const y1 = 3;

      const blockedTile = {isBlocked: () => true};
      const freeTile = {isBlocked: () => false};

      war.randomInRange
        .onCall(0).returns(x)
        .onCall(1).returns(y)
        .onCall(2).returns(x1)
        .onCall(3).returns(y1);

      sinon.stub(war.map, 'getTile')
        .returns(freeTile)
        .withArgs(x, y).returns(blockedTile);

      war.generateArtifacts();
      expect(war.map.setSpecialTile).not.to.have.been.calledWith('artifact0', {x, y});
      expect(war.map.setSpecialTile).to.have.been.calledWith('artifact0', {x: x1, y: y1});

      war.map.getTile.restore();
    });

    afterEach(() => {
      war.randomInRange.restore();
      war.map.setSpecialTile.restore();
    });
  });
});