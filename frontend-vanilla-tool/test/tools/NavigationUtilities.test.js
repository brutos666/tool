import { JSDOM } from 'jsdom';
import NavigationUtilities from '../../src/tools/NavigationUtilities.js';
import assert from 'assert';

describe('NavigationUtilities', () => {
  before(() => {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    global.document = dom.window.document;
    global.window = dom.window;
  });
  after(() => {
    delete global.document;
    delete global.window;
  });
  const AUTHORIZED_CLASS = 'drag-drop--decorator';
  const FORBIDDEN_CLASS = 'drop--forbidden';
  const OTHER_CLASS = 'other';

  describe('#getNextElementSibling()', () => {
    it(`Doit retourner null s'il n'y a pas d'élément suivant`, () => {
      const html = String.raw`<div class="${ AUTHORIZED_CLASS }"></div>`;
      const element = createNode(html);

      const actual = NavigationUtilities.getNextElementSibling(element, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

      assert.ok(actual === null);
    });
    it(`Doit retourner null si l'élément suivant ne contient pas la classe demandée`, () => {
      const html = String.raw`<div class="conteneur">
        <div id="element1" class="${ AUTHORIZED_CLASS }"></div>
        <div id="element2" class="${ OTHER_CLASS }"></div>
      </div>`;
      const conteneur = createNode(html);
      const element1 = conteneur.querySelector('#element1');

      const actual = NavigationUtilities.getNextElementSibling(element1, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

      assert.ok(actual === null);
    });
    it(`Doit retourner null si l'élément suivant contient la classe demandée mais contient aussi la classe interdite`, () => {
      const html = String.raw`<div class="conteneur">
        <div id="element1" class="${ AUTHORIZED_CLASS }"></div>
        <div id="element2" class="${ AUTHORIZED_CLASS } ${ FORBIDDEN_CLASS }"></div>
      </div>`;
      const conteneur = createNode(html);
      const element1 = conteneur.querySelector('#element1');

      const actual = NavigationUtilities.getNextElementSibling(element1, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

      assert.ok(actual === null);
    });

    it(`Doit retourner l'élément suivant s'il contient la classe demandée mais ne contient pas la classe interdite`, () => {
      const html = String.raw`<div class="conteneur">
        <div id="element1" class="${ AUTHORIZED_CLASS }"></div>
        <div id="element2" class="${ AUTHORIZED_CLASS } ${ OTHER_CLASS }"></div>
      </div>`;
      const conteneur = createNode(html);
      const element1 = conteneur.querySelector('#element1');
      const element2 = conteneur.querySelector('#element2');

      const actual = NavigationUtilities.getNextElementSibling(element1, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

      assert.equal(actual, element2);
    });

    it(`Doit retourner l'élément suivant de l'élément suivant si le suivant contient la classe demandée et la classe interdite mais que le suivant du suivant contient la classe autorisée et pas la classe interdite`, () => {
      const html = String.raw`<div class="conteneur">
        <div id="element1" class="${ AUTHORIZED_CLASS }"></div>
        <div id="element2" class="${ AUTHORIZED_CLASS } ${ FORBIDDEN_CLASS }"></div>
        <div id="element3" class="${ AUTHORIZED_CLASS }"></div>
      </div>`;
      const conteneur = createNode(html);
      const element1 = conteneur.querySelector('#element1');
      const element3 = conteneur.querySelector('#element3');

      const actual = NavigationUtilities.getNextElementSibling(element1, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

      assert.equal(actual, element3);
    });

    it(`Doit retourner null si le suivant contient la classe demandée et la classe interdite et que le suivant aussi`, () => {
      const html = String.raw`<div class="conteneur">
        <div id="element1" class="${ AUTHORIZED_CLASS }"></div>
        <div id="element2" class="${ AUTHORIZED_CLASS } ${ FORBIDDEN_CLASS }"></div>
        <div id="element3" class="${ FORBIDDEN_CLASS } ${ AUTHORIZED_CLASS }"></div>
      </div>`;
      const conteneur = createNode(html);
      const element1 = conteneur.querySelector('#element1');

      const actual = NavigationUtilities.getNextElementSibling(element1, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

      assert.ok(actual === null);
    });

    it(`Doit retourner l'élément qui se trouve dans la branche suivante si elle contient un élément avec la classe demandée sans la classe interdite`, () => {
      const html = String.raw`<div class="conteneur">
        <div id="conteneur1"><div id="element1" class="${ AUTHORIZED_CLASS }"></div></div>
        <div id="conteneur2"><div id="element2" class="${ AUTHORIZED_CLASS }"></div></div>
      </div>`;
      const conteneur = createNode(html);
      const element1 = conteneur.querySelector('#element1');
      const element2 = conteneur.querySelector('#element2');

      const actual = NavigationUtilities.getNextElementSibling(element1, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

      assert.equal(actual, element2);
    });

    it(`Doit retourner l'élément de la branche suivante qui contient un élément avec la classe demandée sans la classe interdite`, () => {
      const html = String.raw`<div class="conteneur">
        <div id="conteneur1"><div id="element1" class="${ AUTHORIZED_CLASS }"></div></div>
        <div id="conteneur2"><div id="element2" class="${ AUTHORIZED_CLASS } ${ FORBIDDEN_CLASS }"></div></div>
        <div id="conteneur3"><div id="element3" class="${ AUTHORIZED_CLASS }"></div></div>
      </div>`;
      const conteneur = createNode(html);
      const element1 = conteneur.querySelector('#element1');
      const element3 = conteneur.querySelector('#element3');

      const actual = NavigationUtilities.getNextElementSibling(element1, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

      assert.equal(actual, element3);
    });
  });

  describe('#getPreviousElementSibling()', () => {
    it(`Doit retourner null s'il n'y a pas d'élément précédent`, () => {
      const html = String.raw`<div class="${ AUTHORIZED_CLASS }"></div>`;
      const element = createNode(html);

      const actual = NavigationUtilities.getPreviousElementSibling(element, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

      assert.ok(actual === null);
    });
    it(`Doit retourner null si l'élément précédent ne contient pas la classe demandée`, () => {
      const html = String.raw`<div class="conteneur">
        <div id="element2" class="${ OTHER_CLASS }"></div>
        <div id="element1" class="${ AUTHORIZED_CLASS }"></div>
      </div>`;
      const conteneur = createNode(html);
      const element1 = conteneur.querySelector('#element1');

      const actual = NavigationUtilities.getPreviousElementSibling(element1, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

      assert.ok(actual === null);
    });
    it(`Doit retourner null si l'élément précédent contient la classe demandée mais contient aussi la classe interdite`, () => {
      const html = String.raw`<div class="conteneur">
        <div id="element2" class="${ AUTHORIZED_CLASS } ${ FORBIDDEN_CLASS }"></div>
        <div id="element1" class="${ AUTHORIZED_CLASS }"></div>
      </div>`;
      const conteneur = createNode(html);
      const element1 = conteneur.querySelector('#element1');

      const actual = NavigationUtilities.getPreviousElementSibling(element1, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

      assert.ok(actual === null);
    });

    it(`Doit retourner l'élément précédent s'il contient la classe demandée mais ne contient pas la classe interdite`, () => {
      const html = String.raw`<div class="conteneur">
        <div id="element2" class="${ AUTHORIZED_CLASS } ${ OTHER_CLASS }"></div>
        <div id="element1" class="${ AUTHORIZED_CLASS }"></div>
      </div>`;
      const conteneur = createNode(html);
      const element1 = conteneur.querySelector('#element1');
      const element2 = conteneur.querySelector('#element2');

      const actual = NavigationUtilities.getPreviousElementSibling(element1, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

      assert.equal(actual, element2);
    });

    it(`Doit retourner l'élément précédent de l'élément précédent si le précédent contient la classe demandée et la classe interdite mais que le précédent du précédent contient la classe autorisée et pas la classe interdite`, () => {
      const html = String.raw`<div class="conteneur">
        <div id="element3" class="${ AUTHORIZED_CLASS }"></div>
        <div id="element2" class="${ AUTHORIZED_CLASS } ${ FORBIDDEN_CLASS }"></div>
        <div id="element1" class="${ AUTHORIZED_CLASS }"></div>
      </div>`;
      const conteneur = createNode(html);
      const element1 = conteneur.querySelector('#element1');
      const element3 = conteneur.querySelector('#element3');

      const actual = NavigationUtilities.getPreviousElementSibling(element1, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

      assert.equal(actual, element3);
    });

    it(`Doit retourner null si le précédent contient la classe demandée et la classe interdite et que le précédent aussi`, () => {
      const html = String.raw`<div class="conteneur">
        <div id="element3" class="${ FORBIDDEN_CLASS } ${ AUTHORIZED_CLASS }"></div>
        <div id="element2" class="${ AUTHORIZED_CLASS } ${ FORBIDDEN_CLASS }"></div>
        <div id="element1" class="${ AUTHORIZED_CLASS }"></div>
      </div>`;
      const conteneur = createNode(html);
      const element1 = conteneur.querySelector('#element1');

      const actual = NavigationUtilities.getPreviousElementSibling(element1, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

      assert.ok(actual === null);
    });

    it(`Doit retourner l'élément qui se trouve dans la branche précédente si elle contient un élément avec la classe demandée sans la classe interdite`, () => {
      const html = String.raw`<div class="conteneur">
        <div id="conteneur2"><div id="element2" class="${ AUTHORIZED_CLASS }"></div></div>
        <div id="conteneur1"><div id="element1" class="${ AUTHORIZED_CLASS }"></div></div>
      </div>`;
      const conteneur = createNode(html);
      const element1 = conteneur.querySelector('#element1');
      const element2 = conteneur.querySelector('#element2');

      const actual = NavigationUtilities.getPreviousElementSibling(element1, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

      assert.equal(actual, element2);
    });

    it(`Doit retourner l'élément de la branche précédente qui contient un élément avec la classe demandée sans la classe interdite`, () => {
      const html = String.raw`<div class="conteneur">
        <div id="conteneur3"><div id="element3" class="${ AUTHORIZED_CLASS }"></div></div>
        <div id="conteneur2"><div id="element2" class="${ AUTHORIZED_CLASS } ${ FORBIDDEN_CLASS }"></div></div>
        <div id="conteneur1"><div id="element1" class="${ AUTHORIZED_CLASS }"></div></div>
      </div>`;
      const conteneur = createNode(html);
      const element1 = conteneur.querySelector('#element1');
      const element3 = conteneur.querySelector('#element3');

      const actual = NavigationUtilities.getPreviousElementSibling(element1, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

      assert.equal(actual, element3);
    });
  });

  describe('#getNextElement()', () => {
    it(`Doit retourner null s'il n'y a pas d'élément suivant`, () => {
      const html = String.raw`<div class="conteneur"><div id="element1" class="${ AUTHORIZED_CLASS }"></div></div>`;
      const conteneur = createNode(html);
      const element1 = conteneur.querySelector('#element1');

      const actual = NavigationUtilities.getNextElement(element1, 'next', conteneur, AUTHORIZED_CLASS);

      assert.ok(actual === null);
    });

    it(`Doit retourner l'élément null si l'élément suivant ne possède pas la classe demandée`, () => {
      const html = String.raw`<div class="conteneur">
        <div id="element1" class="${ AUTHORIZED_CLASS }"></div>
        <div id="element2" class="${ OTHER_CLASS }"></div>
      </div>`;
      const conteneur = createNode(html);
      const element1 = conteneur.querySelector('#element1');

      const actual = NavigationUtilities.getNextElement(element1, 'next', conteneur, AUTHORIZED_CLASS);

      assert.ok(actual === null);
    });

    it(`Doit retourner l'élément suivant si l'élément suivant possède la classe demandée et la classe interdite`, () => {
      const html = String.raw`<div class="conteneur">
        <div id="element1" class="${ AUTHORIZED_CLASS }"></div>
        <div id="element2" class="${ AUTHORIZED_CLASS } ${ FORBIDDEN_CLASS }"></div>
      </div>`;
      const conteneur = createNode(html);
      const element1 = conteneur.querySelector('#element1');

      const actual = NavigationUtilities.getNextElement(element1, 'next', conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

      const expected = conteneur.querySelector('#element2');
      assert.equal(actual, expected);
    });

    it(`Doit retourner l'élément suivant s'il existe et possède la classe demandée et pas la classe interdite`, () => {
      const html = String.raw`<div class="conteneur">
        <div id="element1" class="${ AUTHORIZED_CLASS }"></div>
        <div id="element2" class="${ AUTHORIZED_CLASS }"></div>
      </div>`;
      const conteneur = createNode(html);
      const element1 = conteneur.querySelector('#element1');
      const element2 = conteneur.querySelector('#element2');

      const actual = NavigationUtilities.getNextElement(element1, 'next', conteneur, AUTHORIZED_CLASS);

      assert.equal(actual, element2);
    });

    it(`Doit retourner l'élément suivant s'il existe, se trouve dans un sous-noeud et possède la classe demandée et pas la classe interdite`, () => {
      const html = String.raw`<div class="conteneur">
        <div id="element1" class="${ AUTHORIZED_CLASS }"></div>
        <ol><div id="element2" class="${ AUTHORIZED_CLASS }"></div></ol>
      </div>`;
      const conteneur = createNode(html);
      const element1 = conteneur.querySelector('#element1');
      const element2 = conteneur.querySelector('#element2');

      const actual = NavigationUtilities.getNextElement(element1, 'next', conteneur, AUTHORIZED_CLASS);

      assert.equal(actual, element2);
    });

    it(`Doit retourner l'élément suivant s'il existe, se trouve dans un noeud parent mais après l'élément et possède la classe demandée`, () => {
      const html = String.raw`<div class="conteneur">
        <ol><div id="element1" class="${ AUTHORIZED_CLASS }"></div></ol>
        <div id="element2" class="${ AUTHORIZED_CLASS }"></div>
      </div>`;
      const conteneur = createNode(html);
      const element1 = conteneur.querySelector('#element1');
      const element2 = conteneur.querySelector('#element2');

      const actual = NavigationUtilities.getNextElement(element1, 'next', conteneur, AUTHORIZED_CLASS);

      assert.equal(actual, element2);
    });
  });

  describe('#getNextElementDown()', () => {

    /** Arbres */
    describe('Navigation dans des arbres disposés verticalement ', () => {
      beforeEach(() => {
        console.debug(`
Étant donnée les 3 arbres verticaux suivant :
|=======================|
| element1              |
|  |__element1-1        |
|  |__element1-2        |
|  |__element1-3        |
|      |__element1-3-1  |
|=======================|
|=============================|
| element2                    |
|  |__element2-1              |
|  |__element2-2              |
|  |   |__element2-2-1        |
|  |       |__element2-2-1-1  |
|  |__element2-3              |
|=============================|
|=============================|
| element3                    |
|  |__element3-1              |
|  |   |__element3-1-1        |
|  |   |__element3-1-2        |
|  |__element3-2              |
|      |__element3-2-1        |
|=============================|
        `);
      });
      it(`Si je suis sur le noeud element1 ouvert et que je me déplace vers le bas, l'élément suivant est element1-1`, () => {
        const html = getTreesHtml(AUTHORIZED_CLASS, 'vertical');
        const conteneur = createNode(html);
        const element1 = conteneur.querySelector('#element1');

        const actual = NavigationUtilities.getNextElementDown(element1, conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

        const expected = conteneur.querySelector('#element1-1');
        assert.equal(actual, expected);
      });
      it(`Si je suis sur le noeud element1-1 et que je me déplace vers le bas, l'élément suivant est element1-2`, () => {
        const html = getTreesHtml(AUTHORIZED_CLASS, 'vertical');
        const conteneur = createNode(html);
        const element1_1 = conteneur.querySelector('#element1-1');

        const actual = NavigationUtilities.getNextElementDown(element1_1, conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

        const expected = conteneur.querySelector('#element1-2');
        assert.equal(actual, expected);
      });
      it(`Si je suis sur le noeud element1-2 et que je me déplace vers le bas, l'élément suivant est element1-3`, () => {
        const html = getTreesHtml(AUTHORIZED_CLASS, 'vertical');
        const conteneur = createNode(html);
        const element1_2 = conteneur.querySelector('#element1-2');

        const actual = NavigationUtilities.getNextElementDown(element1_2, conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

        const expected = conteneur.querySelector('#element1-3');
        assert.equal(actual, expected);
      });
      it(`Si je suis sur le noeud element1-3 et que je me déplace vers le bas, l'élément suivant est element1-3-1`, () => {
        const html = getTreesHtml(AUTHORIZED_CLASS, 'vertical');
        const conteneur = createNode(html);
        const element1_3 = conteneur.querySelector('#element1-3');

        const actual = NavigationUtilities.getNextElementDown(element1_3, conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

        const expected = conteneur.querySelector('#element1-3-1');
        assert.equal(actual, expected);
      });
      it(`Si je suis sur le noeud element1-3-1 et que je me déplace vers le bas, l'élément suivant est element2`, () => {
        const html = getTreesHtml(AUTHORIZED_CLASS, 'vertical');
        const conteneur = createNode(html);
        const element1_3_1 = conteneur.querySelector('#element1-3-1');

        const actual = NavigationUtilities.getNextElementDown(element1_3_1, conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

        const expected = conteneur.querySelector('#element2');
        assert.equal(actual, expected);
      });
      it(`Si je suis sur le noeud element2-2-1 et que je me déplace vers le bas, l'élément suivant est element2-2-1-1`, () => {
        const html = getTreesHtml(AUTHORIZED_CLASS, 'vertical');
        const conteneur = createNode(html);
        const element2_2_1 = conteneur.querySelector('#element2-2-1');

        const actual = NavigationUtilities.getNextElementDown(element2_2_1, conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

        const expected = conteneur.querySelector('#element2-2-1-1');
        assert.equal(actual, expected);
      });
      it(`Si je suis sur le noeud element2-2-1-1 et que je me déplace vers le bas, l'élément suivant est element2-3`, () => {
        const html = getTreesHtml(AUTHORIZED_CLASS, 'vertical');
        const conteneur = createNode(html);
        const element2_2_1_1 = conteneur.querySelector('#element2-2-1-1');

        const actual = NavigationUtilities.getNextElementDown(element2_2_1_1, conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

        const expected = conteneur.querySelector('#element2-3');
        assert.equal(actual, expected);
      });
      it(`Si je suis sur le noeud element1 qui est fermé et que je me déplace vers le bas, l'élément suivant est element2`, () => {
        const html = getTreesHtml(AUTHORIZED_CLASS, 'vertical');
        const conteneur = createNode(html);
        const element1 = conteneur.querySelector('#element1');
        element1.querySelector('[role="treeitem"]').setAttribute('aria-expanded', 'false');

        const actual = NavigationUtilities.getNextElementDown(element1, conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

        const expected = conteneur.querySelector('#element2');
        assert.equal(actual, expected);
      });
      it(`Si je suis sur le noeud element2-2 qui est fermé et que je me déplace vers le bas, l'élément suivant est l'élément element2-3`, () => {
        const html = getTreesHtml(AUTHORIZED_CLASS, 'vertical');
        const conteneur = createNode(html);
        const element2_2 = conteneur.querySelector('#element2-2');
        element2_2.querySelector('[role="treeitem"]').setAttribute('aria-expanded', 'false');

        const actual = NavigationUtilities.getNextElementDown(element2_2, conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

        const expected = conteneur.querySelector('#element2-3');
        assert.equal(actual, expected);
      });
      it(`Si element3-1 et element3-2 sont fermés, que je suis sur le noeud element3-1 et que je me déplace vers le bas, l'élément suivant est l'élément element3-2`, () => {
        const html = getTreesHtml(AUTHORIZED_CLASS, 'vertical');
        const conteneur = createNode(html);
        const element3_1 = conteneur.querySelector('#element3-1');
        element3_1.querySelector('[role="treeitem"]').setAttribute('aria-expanded', 'false');
        const element3_2 = conteneur.querySelector('#element3-2');
        element3_2.querySelector('[role="treeitem"]').setAttribute('aria-expanded', 'false');

        const actual = NavigationUtilities.getNextElementDown(element3_1, conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

        const expected = conteneur.querySelector('#element3-2');
        assert.equal(actual, expected);
      });
      it(`Si je suis sur le noeud element3-2-1 et que je me déplace vers le bas, l'élément suivant est l'élément null`, () => {
        const html = getTreesHtml(AUTHORIZED_CLASS, 'vertical');
        const conteneur = createNode(html);
        const element3_2_1 = conteneur.querySelector('#element3-2-1');

        const actual = NavigationUtilities.getNextElementDown(element3_2_1, conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

        assert.ok(actual === null);
      });
      /** Avec des éléments interdits **/
      it(`Si je suis sur le noeud element1 ouvert et que je me déplace vers le bas, si l'élément element1-1 est interdit, l'élément suivant est element1-2`, () => {
        const html = getTreesHtml(AUTHORIZED_CLASS, 'vertical');
        const conteneur = createNode(html);
        const element1 = conteneur.querySelector('#element1');
        conteneur.querySelector('#element1-1').classList.add(FORBIDDEN_CLASS);

        const actual = NavigationUtilities.getNextElementDown(element1, conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

        const expected = conteneur.querySelector('#element1-2');
        assert.equal(actual, expected);
      });
      it(`Si je suis sur le noeud element1 ouvert et que je me déplace vers le bas, si l'élément element1-1 et element1-2 sont interdits, l'élément suivant est element1-3`, () => {
        const html = getTreesHtml(AUTHORIZED_CLASS, 'vertical');
        const conteneur = createNode(html);
        const element1 = conteneur.querySelector('#element1');
        conteneur.querySelector('#element1-1').classList.add(FORBIDDEN_CLASS);
        conteneur.querySelector('#element1-2').classList.add(FORBIDDEN_CLASS);

        const actual = NavigationUtilities.getNextElementDown(element1, conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

        const expected = conteneur.querySelector('#element1-3');
        assert.equal(actual, expected);
      });
      it(`Si je suis sur le noeud element1 ouvert et que je me déplace vers le bas, si les éléments element1-1, element1-2, element1-3 sont interdits, l'élément suivant est element1-3-1`, () => {
        const html = getTreesHtml(AUTHORIZED_CLASS, 'vertical');
        const conteneur = createNode(html);
        const element1 = conteneur.querySelector('#element1');
        conteneur.querySelector('#element1-1').classList.add(FORBIDDEN_CLASS);
        conteneur.querySelector('#element1-2').classList.add(FORBIDDEN_CLASS);
        conteneur.querySelector('#element1-3').classList.add(FORBIDDEN_CLASS);

        const actual = NavigationUtilities.getNextElementDown(element1, conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

        const expected = conteneur.querySelector('#element1-3-1');
        assert.equal(actual, expected);
      });
      it(`Si je suis sur le noeud element1 ouvert et que je me déplace vers le bas, si les éléments element1-1, element1-2, element1-3, element1-3-1 sont interdits, l'élément suivant est element2`, () => {
        const html = getTreesHtml(AUTHORIZED_CLASS, 'vertical');
        const conteneur = createNode(html);
        const element1 = conteneur.querySelector('#element1');
        conteneur.querySelector('#element1-1').classList.add(FORBIDDEN_CLASS);
        conteneur.querySelector('#element1-2').classList.add(FORBIDDEN_CLASS);
        conteneur.querySelector('#element1-3').classList.add(FORBIDDEN_CLASS);
        conteneur.querySelector('#element1-3-1').classList.add(FORBIDDEN_CLASS);

        const actual = NavigationUtilities.getNextElementDown(element1, conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

        const expected = conteneur.querySelector('#element2');
        assert.equal(actual, expected);
      });
      it(`Si je suis sur le noeud element2-2-1 ouvert et que je me déplace vers le bas, si l'élément element2-2-1-1 est interdit, l'élément suivant est element2-3`, () => {
        const html = getTreesHtml(AUTHORIZED_CLASS, 'vertical');
        const conteneur = createNode(html);
        const element2_2_1 = conteneur.querySelector('#element2-2-1');
        conteneur.querySelector('#element2-2-1-1').classList.add(FORBIDDEN_CLASS);

        const actual = NavigationUtilities.getNextElementDown(element2_2_1, conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

        const expected = conteneur.querySelector('#element2-3');
        assert.equal(actual, expected);
      });
      it(`Si je suis sur le noeud element2-2-1 ouvert et que je me déplace vers le bas, si tous les éléments suivants sont interdits, l'élément suivant est null`, () => {
        const html = getTreesHtml(AUTHORIZED_CLASS, 'vertical');
        const conteneur = createNode(html);
        const element2_2_1 = conteneur.querySelector('#element2-2-1');
        conteneur.querySelector('#element2-2-1-1').classList.add(FORBIDDEN_CLASS);
        conteneur.querySelector('#element2-3').classList.add(FORBIDDEN_CLASS);
        conteneur.querySelector('#element3').classList.add(FORBIDDEN_CLASS);
        conteneur.querySelector('#element3-1').classList.add(FORBIDDEN_CLASS);
        conteneur.querySelector('#element3-1-1').classList.add(FORBIDDEN_CLASS);
        conteneur.querySelector('#element3-1-2').classList.add(FORBIDDEN_CLASS);
        conteneur.querySelector('#element3-2').classList.add(FORBIDDEN_CLASS);
        conteneur.querySelector('#element3-2-1').classList.add(FORBIDDEN_CLASS);

        const actual = NavigationUtilities.getNextElementDown(element2_2_1, conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

        assert.ok(actual === null);
      });
    });

    describe('Navigation dans des arbres disposés horizontalement ', () => {
      beforeEach(() => {
        console.debug(`
Étant donnée les 3 arbres horizontaux suivant :
|=======================|   |=============================|  |=============================|
| element1              |   | element2                    |  | element3                    |
|  |__element1-1        |   |  |__element2-1              |  |  |__element3-1              |
|  |__element1-2        |   |  |__element2-2              |  |  |   |__element3-1-1        |
|  |__element1-3        |   |  |   |__element2-2-1        |  |  |   |__element3-1-2        |
|      |__element1-3-1  |   |  |       |__element2-2-1-1  |  |  |__element3-2              |
|=======================|   |  |__element2-3              |  |      |__element3-2-1        |
                            |=============================|  |=============================|
        `);
      });
      it(`Si je suis sur le noeud element1 ouvert et que je me déplace vers le bas, l'élément suivant est element1-1`, () => {
        const html = getTreesHtml(AUTHORIZED_CLASS, 'horizontal');
        const conteneur = createNode(html);
        const element1 = conteneur.querySelector('#element1');

        const actual = NavigationUtilities.getNextElementDown(element1, conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

        const expected = conteneur.querySelector('#element1-1');
        assert.equal(actual, expected);
      });
      it(`Si je suis sur le noeud element1-1 et que je me déplace vers le bas, l'élément suivant est element1-2`, () => {
        const html = getTreesHtml(AUTHORIZED_CLASS, 'horizontal');
        const conteneur = createNode(html);
        const element1_1 = conteneur.querySelector('#element1-1');

        const actual = NavigationUtilities.getNextElementDown(element1_1, conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

        const expected = conteneur.querySelector('#element1-2');
        assert.equal(actual, expected);
      });
      it(`Si je suis sur le noeud element1-2 et que je me déplace vers le bas, l'élément suivant est element1-3`, () => {
        const html = getTreesHtml(AUTHORIZED_CLASS, 'horizontal');
        const conteneur = createNode(html);
        const element1_2 = conteneur.querySelector('#element1-2');

        const actual = NavigationUtilities.getNextElementDown(element1_2, conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

        const expected = conteneur.querySelector('#element1-3');
        assert.equal(actual, expected);
      });
      it(`Si je suis sur le noeud element1-3 et que je me déplace vers le bas, l'élément suivant est element1-3-1`, () => {
        const html = getTreesHtml(AUTHORIZED_CLASS, 'horizontal');
        const conteneur = createNode(html);
        const element1_3 = conteneur.querySelector('#element1-3');

        const actual = NavigationUtilities.getNextElementDown(element1_3, conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

        const expected = conteneur.querySelector('#element1-3-1');
        assert.equal(actual, expected);
      });
      it(`Si je suis sur le noeud element2-2-1 et que je me déplace vers le bas, l'élément suivant est element2-2-1-1`, () => {
        const html = getTreesHtml(AUTHORIZED_CLASS, 'horizontal');
        const conteneur = createNode(html);
        const element2_2_1 = conteneur.querySelector('#element2-2-1');

        const actual = NavigationUtilities.getNextElementDown(element2_2_1, conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

        const expected = conteneur.querySelector('#element2-2-1-1');
        assert.equal(actual, expected);
      });
      it(`Si je suis sur le noeud element2-2-1-1 et que je me déplace vers le bas, l'élément suivant est element2-3`, () => {
        const html = getTreesHtml(AUTHORIZED_CLASS, 'horizontal');
        const conteneur = createNode(html);
        const element2_2_1_1 = conteneur.querySelector('#element2-2-1-1');

        const actual = NavigationUtilities.getNextElementDown(element2_2_1_1, conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

        const expected = conteneur.querySelector('#element2-3');
        assert.equal(actual, expected);
      });
      it(`Si je suis sur le noeud element1 qui est fermé et que je me déplace vers le bas, l'élément suivant est null`, () => {
        const html = getTreesHtml(AUTHORIZED_CLASS, 'horizontal');
        const conteneur = createNode(html);
        const element1 = conteneur.querySelector('#element1');
        element1.querySelector('[role="treeitem"]').setAttribute('aria-expanded', 'false');

        const actual = NavigationUtilities.getNextElementDown(element1, conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

        assert.ok(actual === null);
      });
      it(`Si je suis sur le noeud element2-2 qui est fermé et que je me déplace vers le bas, l'élément suivant est l'élément element2-3`, () => {
        const html = getTreesHtml(AUTHORIZED_CLASS, 'horizontal');
        const conteneur = createNode(html);
        const element2_2 = conteneur.querySelector('#element2-2');
        element2_2.querySelector('[role="treeitem"]').setAttribute('aria-expanded', 'false');

        const actual = NavigationUtilities.getNextElementDown(element2_2, conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

        const expected = conteneur.querySelector('#element2-3');
        assert.equal(actual, expected);
      });
      it(`Si element3-1 et element3-2 sont fermés, que je suis sur le noeud element3-1 et que je me déplace vers le bas, l'élément suivant est l'élément element3-2`, () => {
        const html = getTreesHtml(AUTHORIZED_CLASS, 'horizontal');
        const conteneur = createNode(html);
        const element3_1 = conteneur.querySelector('#element3-1');
        element3_1.querySelector('[role="treeitem"]').setAttribute('aria-expanded', 'false');
        const element3_2 = conteneur.querySelector('#element3-2');
        element3_2.querySelector('[role="treeitem"]').setAttribute('aria-expanded', 'false');

        const actual = NavigationUtilities.getNextElementDown(element3_1, conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

        const expected = conteneur.querySelector('#element3-2');
        assert.equal(actual, expected);
      });

      /** Avec des éléments interdits **/
      it(`Si je suis sur le noeud element1 ouvert et que je me déplace vers le bas, si l'élément element1-1 est interdit, l'élément suivant est element1-2`, () => {
        const html = getTreesHtml(AUTHORIZED_CLASS, 'horizontal');
        const conteneur = createNode(html);
        const element1 = conteneur.querySelector('#element1');
        conteneur.querySelector('#element1-1').classList.add(FORBIDDEN_CLASS);

        const actual = NavigationUtilities.getNextElementDown(element1, conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

        const expected = conteneur.querySelector('#element1-2');
        assert.equal(actual, expected);
      });
      it(`Si je suis sur le noeud element1 ouvert et que je me déplace vers le bas, si l'élément element1-1 et element1-2 sont interdits, l'élément suivant est element1-3`, () => {
        const html = getTreesHtml(AUTHORIZED_CLASS, 'horizontal');
        const conteneur = createNode(html);
        const element1 = conteneur.querySelector('#element1');
        conteneur.querySelector('#element1-1').classList.add(FORBIDDEN_CLASS);
        conteneur.querySelector('#element1-2').classList.add(FORBIDDEN_CLASS);

        const actual = NavigationUtilities.getNextElementDown(element1, conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

        const expected = conteneur.querySelector('#element1-3');
        assert.equal(actual, expected);
      });
      it(`Si je suis sur le noeud element1 ouvert et que je me déplace vers le bas, si les éléments element1-1, element1-2, element1-3 sont interdits, l'élément suivant est element1-3-1`, () => {
        const html = getTreesHtml(AUTHORIZED_CLASS, 'horizontal');
        const conteneur = createNode(html);
        const element1 = conteneur.querySelector('#element1');
        conteneur.querySelector('#element1-1').classList.add(FORBIDDEN_CLASS);
        conteneur.querySelector('#element1-2').classList.add(FORBIDDEN_CLASS);
        conteneur.querySelector('#element1-3').classList.add(FORBIDDEN_CLASS);

        const actual = NavigationUtilities.getNextElementDown(element1, conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

        const expected = conteneur.querySelector('#element1-3-1');
        assert.equal(actual, expected);
      });
      it(`Si je suis sur le noeud element1 ouvert et que je me déplace vers le bas, si les éléments element1-1, element1-2, element1-3, element1-3-1 sont interdits, l'élément suivant est null`, () => {
        const html = getTreesHtml(AUTHORIZED_CLASS, 'horizontal');
        const conteneur = createNode(html);
        const element1 = conteneur.querySelector('#element1');
        conteneur.querySelector('#element1-1').classList.add(FORBIDDEN_CLASS);
        conteneur.querySelector('#element1-2').classList.add(FORBIDDEN_CLASS);
        conteneur.querySelector('#element1-3').classList.add(FORBIDDEN_CLASS);
        conteneur.querySelector('#element1-3-1').classList.add(FORBIDDEN_CLASS);

        const actual = NavigationUtilities.getNextElementDown(element1, conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

        const expected = null;
        assert.equal(actual, expected);
      });
      it(`Si je suis sur le noeud element2-2-1 ouvert et que je me déplace vers le bas, si l'élément element2-2-1-1 est interdit, l'élément suivant est element2-3`, () => {
        const html = getTreesHtml(AUTHORIZED_CLASS, 'horizontal');
        const conteneur = createNode(html);
        const element2_2_1 = conteneur.querySelector('#element2-2-1');
        conteneur.querySelector('#element2-2-1-1').classList.add(FORBIDDEN_CLASS);

        const actual = NavigationUtilities.getNextElementDown(element2_2_1, conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

        const expected = conteneur.querySelector('#element2-3');
        assert.equal(actual, expected);
      });
      it(`Si je suis sur le noeud element2-2-1 ouvert et que je me déplace vers le bas, si tous les éléments suivants sont interdits, l'élément suivant est null`, () => {
        const html = getTreesHtml(AUTHORIZED_CLASS, 'horizontal');
        const conteneur = createNode(html);
        const element2_2_1 = conteneur.querySelector('#element2-2-1');
        conteneur.querySelector('#element2-2-1-1').classList.add(FORBIDDEN_CLASS);
        conteneur.querySelector('#element2-3').classList.add(FORBIDDEN_CLASS);
        conteneur.querySelector('#element3').classList.add(FORBIDDEN_CLASS);
        conteneur.querySelector('#element3-1').classList.add(FORBIDDEN_CLASS);
        conteneur.querySelector('#element3-1-1').classList.add(FORBIDDEN_CLASS);
        conteneur.querySelector('#element3-1-2').classList.add(FORBIDDEN_CLASS);
        conteneur.querySelector('#element3-2').classList.add(FORBIDDEN_CLASS);
        conteneur.querySelector('#element3-2-1').classList.add(FORBIDDEN_CLASS);

        const actual = NavigationUtilities.getNextElementDown(element2_2_1, conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

        assert.ok(actual === null);
      });
    });

    /** Table */
    describe('Navigation dans une table', () => {
      beforeEach(() => {
       console.debug(`
Étant donnée la table suivante :
|===============|===============|===============|
|                     headTop                   |
|===============|===============|===============|
|  headColumn1  |  headColumn2  |  headColumn3  |
|===============|===============|===============|
| cell1Element1 | cell2Element1 | cell3Element1 |
| cell1Element2 | cell2Element2 |               |
| cell1Element3 |               |               |
|===============|===============|===============|
        `);
      });

      it(`Si je suis sur l'élément headTop et que je descend, l'élément suivant est headColumn1`, () => {
        const html = getTableHtml(AUTHORIZED_CLASS);
        const conteneur = createNode(html);
        const headTop = conteneur.querySelector('#headTop');

        const actual = NavigationUtilities.getNextElementDown(headTop, conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

        const expected = conteneur.querySelector('#headColumn1');
        assert.equal(actual, expected);
      });
      it(`Si je suis sur l'élément headTop, que headColumn1 est interdit et que je descend, l'élément suivant est cell1Element1`, () => {
        const html = getTableHtml(AUTHORIZED_CLASS);
        const conteneur = createNode(html);
        conteneur.querySelector('#headColumn1').classList.add(FORBIDDEN_CLASS);
        const headTop = conteneur.querySelector('#headTop');

        const actual = NavigationUtilities.getNextElementDown(headTop, conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

        const expected = conteneur.querySelector('#cell1Element1');
        assert.equal(actual, expected);
      });
      it(`Si je suis sur l'élément headTop, que headColumn1 et cell1Element1 sont interdits et que je descend, l'élément suivant est cell1Element2`, () => {
        const html = getTableHtml(AUTHORIZED_CLASS);
        const conteneur = createNode(html);
        conteneur.querySelector('#headColumn1').classList.add(FORBIDDEN_CLASS);
        conteneur.querySelector('#cell1Element1').classList.add(FORBIDDEN_CLASS);
        const headTop = conteneur.querySelector('#headTop');

        const actual = NavigationUtilities.getNextElementDown(headTop, conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

        const expected = conteneur.querySelector('#cell1Element2');
        assert.equal(actual, expected);
      });
      it(`Si je suis sur l'élément headTop, que headColumn1, cell1Element1 et cell1Element2 sont interdits et que je descend, l'élément suivant est cell1Element3`, () => {
        const html = getTableHtml(AUTHORIZED_CLASS);
        const conteneur = createNode(html);
        conteneur.querySelector('#headColumn1').classList.add(FORBIDDEN_CLASS);
        conteneur.querySelector('#cell1Element1').classList.add(FORBIDDEN_CLASS);
        conteneur.querySelector('#cell1Element2').classList.add(FORBIDDEN_CLASS);
        const headTop = conteneur.querySelector('#headTop');

        const actual = NavigationUtilities.getNextElementDown(headTop, conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

        const expected = conteneur.querySelector('#cell1Element3');
        assert.equal(actual, expected);
      });
      it(`Si je suis sur l'élément headTop, que tous les éléments suivants sont interdits et que je descend, l'élément suivant est null`, () => {
        const html = getTableHtml(AUTHORIZED_CLASS);
        const conteneur = createNode(html);
        conteneur.querySelector('#headColumn1').classList.add(FORBIDDEN_CLASS);
        conteneur.querySelector('#cell1Element1').classList.add(FORBIDDEN_CLASS);
        conteneur.querySelector('#cell1Element2').classList.add(FORBIDDEN_CLASS);
        conteneur.querySelector('#cell1Element3').classList.add(FORBIDDEN_CLASS);
        const headTop = conteneur.querySelector('#headTop');

        const actual = NavigationUtilities.getNextElementDown(headTop, conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

        const expected = conteneur.querySelector('#cell1Element3');
        assert.ok(actual === null);
      });
      it(`Si je suis sur l'élément headColumn1 et que je descend, l'élément suivant est cellElement1`, () => {
        const html = getTableHtml(AUTHORIZED_CLASS);
        const conteneur = createNode(html);
        const headColumn1 = conteneur.querySelector('#headColumn1');

        const actual = NavigationUtilities.getNextElementDown(headColumn1, conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

        const expected = conteneur.querySelector('#cell1Element1');
        assert.equal(actual, expected);
      });
      it(`Si je suis sur l'élément cell1Element1 et que je descend, l'élément suivant est cell1Element2`, () => {
        const html = getTableHtml(AUTHORIZED_CLASS);
        const conteneur = createNode(html);
        const cell1Element1 = conteneur.querySelector('#cell1Element1');

        const actual = NavigationUtilities.getNextElementDown(cell1Element1, conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

        const expected = conteneur.querySelector('#cell1Element2');
        assert.equal(actual, expected);
      });
      it(`Si je suis sur l'élément cell1Element2 et que je descend, l'élément suivant est cell1Element3`, () => {
        const html = getTableHtml(AUTHORIZED_CLASS);
        const conteneur = createNode(html);
        const cell1Element2 = conteneur.querySelector('#cell1Element2');

        const actual = NavigationUtilities.getNextElementDown(cell1Element2, conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

        const expected = conteneur.querySelector('#cell1Element3');
        assert.equal(actual, expected);
      });
      it(`Si je suis sur l'élément cell1Element3 et que je descend, l'élément suivant est null`, () => {
        const html = getTableHtml(AUTHORIZED_CLASS);
        const conteneur = createNode(html);
        const cell1Element3 = conteneur.querySelector('#cell1Element3');

        const actual = NavigationUtilities.getNextElementDown(cell1Element3, conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

        assert.ok(actual === null);
      });
      it(`Si je suis sur l'élément headColumn2 et que je descend, l'élément suivant est cell2Element1`, () => {
        const html = getTableHtml(AUTHORIZED_CLASS);
        const conteneur = createNode(html);
        const headColumn2 = conteneur.querySelector('#headColumn2');

        const actual = NavigationUtilities.getNextElementDown(headColumn2, conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

        const expected = conteneur.querySelector('#cell2Element1');
        assert.equal(actual, expected);
      });
    });
  });
  describe('#getNextElementRight()', () => {
    /** Arbres */
    describe('Navigation dans des arbres disposés verticalement ', () => {
      beforeEach(() => {
        console.debug(`
Étant donnée les 3 arbres verticaux suivant :
|=======================|
| element1              |
|  |__element1-1        |
|  |__element1-2        |
|  |__element1-3        |
|      |__element1-3-1  |
|=======================|
|=============================|
| element2                    |
|  |__element2-1              |
|  |__element2-2              |
|  |   |__element2-2-1        |
|  |       |__element2-2-1-1  |
|  |__element2-3              |
|=============================|
|=============================|
| element3                    |
|  |__element3-1              |
|  |   |__element3-1-1        |
|  |   |__element3-1-2        |
|  |__element3-2              |
|      |__element3-2-1        |
|=============================|
        `);
      });
      it(`Si je suis sur le noeud element1 ouvert et que je me déplace vers la droite, l'élément suivant est null`, () => {
        const html = getTreesHtml(AUTHORIZED_CLASS, 'vertical');
        const conteneur = createNode(html);
        const element1 = conteneur.querySelector('#element1');

        const actual = NavigationUtilities.getNextElementRight(element1, conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

        assert.ok(actual === null);
      });
      it(`Si je suis sur le noeud element1-1 et que je me déplace vers la droite, l'élément suivant est null`, () => {
        const html = getTreesHtml(AUTHORIZED_CLASS, 'vertical');
        const conteneur = createNode(html);
        const element1_1 = conteneur.querySelector('#element1-1');

        const actual = NavigationUtilities.getNextElementRight(element1_1, conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

        assert.ok(actual === null);
      });
      it(`Si je suis sur le noeud element1-2 et que je me déplace vers la droite, l'élément suivant est null`, () => {
        const html = getTreesHtml(AUTHORIZED_CLASS, 'vertical');
        const conteneur = createNode(html);
        const element1_2 = conteneur.querySelector('#element1-2');

        const actual = NavigationUtilities.getNextElementRight(element1_2, conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

        assert.ok(actual === null);
      });
      it(`Si je suis sur le noeud element1-3 et que je me déplace vers la droite, l'élément suivant est null`, () => {
        const html = getTreesHtml(AUTHORIZED_CLASS, 'vertical');
        const conteneur = createNode(html);
        const element1_3 = conteneur.querySelector('#element1-3');

        const actual = NavigationUtilities.getNextElementRight(element1_3, conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

        assert.ok(actual === null);
      });
      it(`Si je suis sur le noeud element1-3-1 et que je me déplace vers la droite, l'élément suivant est null`, () => {
        const html = getTreesHtml(AUTHORIZED_CLASS, 'vertical');
        const conteneur = createNode(html);
        const element1_3_1 = conteneur.querySelector('#element1-3-1');

        const actual = NavigationUtilities.getNextElementRight(element1_3_1, conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

        assert.ok(actual === null);
      });
      it(`Si je suis sur le noeud element2-2-1 et que je me déplace vers la droite, l'élément suivant est null`, () => {
        const html = getTreesHtml(AUTHORIZED_CLASS, 'vertical');
        const conteneur = createNode(html);
        const element2_2_1 = conteneur.querySelector('#element2-2-1');

        const actual = NavigationUtilities.getNextElementRight(element2_2_1, conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

        assert.ok(actual === null);
      });
      it(`Si je suis sur le noeud element2-2-1-1 et que je me déplace vers la droite, l'élément suivant est null`, () => {
        const html = getTreesHtml(AUTHORIZED_CLASS, 'vertical');
        const conteneur = createNode(html);
        const element2_2_1_1 = conteneur.querySelector('#element2-2-1-1');

        const actual = NavigationUtilities.getNextElementRight(element2_2_1_1, conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

        assert.ok(actual === null);
      });
      it(`Si je suis sur le noeud element1 qui est fermé et que je me déplace vers la droite, l'élément suivant est element1 ouvert`, () => {
        const html = getTreesHtml(AUTHORIZED_CLASS, 'vertical');
        const conteneur = createNode(html);
        const element1 = conteneur.querySelector('#element1');
        element1.querySelector('[role="treeitem"]').setAttribute('aria-expanded', 'false');

        const actual = NavigationUtilities.getNextElementRight(element1, conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

        assert.equal(actual, element1);
        assert.ok(element1.querySelector('[role="treeitem"]').getAttribute('aria-expanded') === 'true');
      });
      it(`Si je suis sur le noeud element2-2 qui est fermé et que je me déplace vers la droite, l'élément suivant est element2-2 ouvert`, () => {
        const html = getTreesHtml(AUTHORIZED_CLASS, 'vertical');
        const conteneur = createNode(html);
        const element2_2 = conteneur.querySelector('#element2-2');
        element2_2.querySelector('[role="treeitem"]').setAttribute('aria-expanded', 'false');

        const actual = NavigationUtilities.getNextElementRight(element2_2, conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

        assert.equal(actual, element2_2);
        assert.ok(element2_2.querySelector('[role="treeitem"]').getAttribute('aria-expanded') === 'true');
      });
      it(`Si element3-1 et element3-2 sont fermés, que je suis sur le noeud element3-1 et que je me déplace vers la droite, l'élément suivant est element3-1 ouvert`, () => {
        const html = getTreesHtml(AUTHORIZED_CLASS, 'vertical');
        const conteneur = createNode(html);
        const element3_1 = conteneur.querySelector('#element3-1');
        element3_1.querySelector('[role="treeitem"]').setAttribute('aria-expanded', 'false');
        const element3_2 = conteneur.querySelector('#element3-2');
        element3_2.querySelector('[role="treeitem"]').setAttribute('aria-expanded', 'false');

        const actual = NavigationUtilities.getNextElementRight(element3_1, conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

        assert.equal(actual, element3_1);
        assert.ok(element3_1.querySelector('[role="treeitem"]').getAttribute('aria-expanded') === 'true');
      });
      it(`Si je suis sur le noeud element3-2-1 et que je me déplace vers la droite, l'élément suivant est l'élément null`, () => {
        const html = getTreesHtml(AUTHORIZED_CLASS, 'vertical');
        const conteneur = createNode(html);
        const element3_2_1 = conteneur.querySelector('#element3-2-1');

        const actual = NavigationUtilities.getNextElementRight(element3_2_1, conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

        assert.ok(actual === null);
      });
      /** Avec des éléments interdits **/
      it(`Si je suis sur le noeud element1 ouvert et que je me déplace vers la droite, si l'élément element2 est interdit, l'élément suivant est null`, () => {
        const html = getTreesHtml(AUTHORIZED_CLASS, 'vertical');
        const conteneur = createNode(html);
        const element1 = conteneur.querySelector('#element1');
        conteneur.querySelector('#element2').classList.add(FORBIDDEN_CLASS);

        const actual = NavigationUtilities.getNextElementRight(element1, conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

        assert.ok(actual === null);
      });
    })
    
    describe('Navigation dans des arbres disposés horizontalement ', () => {
      beforeEach(() => {
        console.debug(`
Étant donnée les 3 arbres horizontaux suivant :
|=======================|   |=============================|  |=============================|
| element1              |   | element2                    |  | element3                    |
|  |__element1-1        |   |  |__element2-1              |  |  |__element3-1              |
|  |__element1-2        |   |  |__element2-2              |  |  |   |__element3-1-1        |
|  |__element1-3        |   |  |   |__element2-2-1        |  |  |   |__element3-1-2        |
|      |__element1-3-1  |   |  |       |__element2-2-1-1  |  |  |__element3-2              |
|=======================|   |  |__element2-3              |  |      |__element3-2-1        |
                            |=============================|  |=============================|
        `);
      });
      it(`Si je suis sur le noeud element1 ouvert et que je me déplace vers la droite, l'élément suivant est element2`, () => {
        const html = getTreesHtml(AUTHORIZED_CLASS, 'horizontal');
        const conteneur = createNode(html);
        const element1 = conteneur.querySelector('#element1');

        const actual = NavigationUtilities.getNextElementRight(element1, conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

        const expected = conteneur.querySelector('#element2');
        assert.equal(actual, expected);
      });
      it(`Si je suis sur le noeud element1-1 et que je me déplace vers la droite, l'élément suivant est element2`, () => {
        const html = getTreesHtml(AUTHORIZED_CLASS, 'horizontal');
        const conteneur = createNode(html);
        const element1_1 = conteneur.querySelector('#element1-1');

        const actual = NavigationUtilities.getNextElementRight(element1_1, conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

        const expected = conteneur.querySelector('#element2');
        assert.equal(actual, expected);
      });
      it(`Si je suis sur le noeud element1-2 et que je me déplace vers la droite, l'élément suivant est element2`, () => {
        const html = getTreesHtml(AUTHORIZED_CLASS, 'horizontal');
        const conteneur = createNode(html);
        const element1_2 = conteneur.querySelector('#element1-2');

        const actual = NavigationUtilities.getNextElementRight(element1_2, conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

        const expected = conteneur.querySelector('#element2');
        assert.equal(actual, expected);
      });
      it(`Si je suis sur le noeud element1-3 et que je me déplace vers la droite, l'élément suivant est element2`, () => {
        const html = getTreesHtml(AUTHORIZED_CLASS, 'horizontal');
        const conteneur = createNode(html);
        const element1_3 = conteneur.querySelector('#element1-3');

        const actual = NavigationUtilities.getNextElementRight(element1_3, conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

        const expected = conteneur.querySelector('#element2');
        assert.equal(actual, expected);
      });
      it(`Si je suis sur le noeud element2-2-1 et que je me déplace vers la droite, l'élément suivant est element3`, () => {
        const html = getTreesHtml(AUTHORIZED_CLASS, 'horizontal');
        const conteneur = createNode(html);
        const element2_2_1 = conteneur.querySelector('#element2-2-1');

        const actual = NavigationUtilities.getNextElementRight(element2_2_1, conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

        const expected = conteneur.querySelector('#element3');
        assert.equal(actual, expected);
      });
      it(`Si je suis sur le noeud element2-2-1-1 et que je me déplace vers la droite, l'élément suivant est element3`, () => {
        const html = getTreesHtml(AUTHORIZED_CLASS, 'horizontal');
        const conteneur = createNode(html);
        const element2_2_1_1 = conteneur.querySelector('#element2-2-1-1');

        const actual = NavigationUtilities.getNextElementRight(element2_2_1_1, conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

        const expected = conteneur.querySelector('#element3');
        assert.equal(actual, expected);
      });
      it(`Si je suis sur le noeud element1 qui est fermé et que je me déplace vers la droite, l'élément suivant est element1 et le noeud est ouvert`, () => {
        const html = getTreesHtml(AUTHORIZED_CLASS, 'horizontal');
        const conteneur = createNode(html);
        const element1 = conteneur.querySelector('#element1');
        element1.querySelector('[role="treeitem"]').setAttribute('aria-expanded', 'false');

        const actual = NavigationUtilities.getNextElementRight(element1, conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

        assert.equal(actual, element1);
        assert.equal(element1.querySelector('[role="treeitem"]').getAttribute('aria-expanded'), 'true');
      });
      it(`Si je suis sur le noeud element2-2 qui est fermé et que je me déplace vers la droite, l'élément suivant est l'élément element2-2 ouvert`, () => {
        const html = getTreesHtml(AUTHORIZED_CLASS, 'horizontal');
        const conteneur = createNode(html);
        const element2_2 = conteneur.querySelector('#element2-2');
        element2_2.querySelector('[role="treeitem"]').setAttribute('aria-expanded', 'false');

        const actual = NavigationUtilities.getNextElementRight(element2_2, conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

        assert.equal(actual, element2_2);
        assert.equal(element2_2.querySelector('[role="treeitem"]').getAttribute('aria-expanded'), 'true');
      });
      it(`Si element3-1 et element3-2 sont fermés, que je suis sur le noeud element3-1 et que je me déplace vers la droite, l'élément suivant est l'élément element3-2 ouvert`, () => {
        const html = getTreesHtml(AUTHORIZED_CLASS, 'horizontal');
        const conteneur = createNode(html);
        const element3_1 = conteneur.querySelector('#element3-1');
        element3_1.querySelector('[role="treeitem"]').setAttribute('aria-expanded', 'false');
        const element3_2 = conteneur.querySelector('#element3-2');
        element3_2.querySelector('[role="treeitem"]').setAttribute('aria-expanded', 'false');

        const actual = NavigationUtilities.getNextElementRight(element3_1, conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

        assert.equal(actual, element3_1);
        assert.equal(element3_1.querySelector('[role="treeitem"]').getAttribute('aria-expanded'), 'true');
      });

      /** Avec des éléments interdits **/
      it(`Si je suis sur le noeud element1 ouvert et que je me déplace vers la droite, si l'élément element2 est interdit, l'élément suivant est element3`, () => {
        const html = getTreesHtml(AUTHORIZED_CLASS, 'horizontal');
        const conteneur = createNode(html);
        const element1 = conteneur.querySelector('#element1');
        conteneur.querySelector('#element2').classList.add(FORBIDDEN_CLASS);

        const actual = NavigationUtilities.getNextElementRight(element1, conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

        const expected = conteneur.querySelector('#element3');
        assert.equal(actual, expected);
      });
      it(`Si je suis sur le noeud element1 ouvert et que je me déplace vers la droite, si les éléments element2 et element3 sont interdits, l'élément suivant est null`, () => {
        const html = getTreesHtml(AUTHORIZED_CLASS, 'horizontal');
        const conteneur = createNode(html);
        const element1 = conteneur.querySelector('#element1');
        conteneur.querySelector('#element2').classList.add(FORBIDDEN_CLASS);
        conteneur.querySelector('#element3').classList.add(FORBIDDEN_CLASS);

        const actual = NavigationUtilities.getNextElementRight(element1, conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

        assert.ok(actual === null);
      });
    });

    describe('Navigation dans une table', () => {
      beforeEach(() => {
       console.debug(`
Étant donnée la table suivante :
|===============|===============|===============|
|                     headTop                   |
|===============|===============|===============|
|  headColumn1  |  headColumn2  |  headColumn3  |
|===============|===============|===============|
| cell1Element1 | cell2Element1 | cell3Element1 |
| cell1Element2 | cell2Element2 |               |
| cell1Element3 |               |               |
|===============|===============|===============|
        `);
      });

      it(`Si je suis sur l'élément headTop et que je me déplace à droite, l'élément suivant est null`, () => {
        const html = getTableHtml(AUTHORIZED_CLASS);
        const conteneur = createNode(html);
        const headTop = conteneur.querySelector('#headTop');

        const actual = NavigationUtilities.getNextElementRight(headTop, conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

        assert.ok(actual === null);
      });
      it(`Si je suis sur l'élément headColumn1 et que je me déplace à droite, l'élément suivant est headColumn2`, () => {
        const html = getTableHtml(AUTHORIZED_CLASS);
        const conteneur = createNode(html);
        const headColumn1 = conteneur.querySelector('#headColumn1');

        const actual = NavigationUtilities.getNextElementRight(headColumn1, conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

        const expected = conteneur.querySelector('#headColumn2');
        assert.ok(actual, expected);
      });
      it(`Si je suis sur l'élément headColumn1, que headColumn2 est interdit et que je me déplace à droite, l'élément suivant est headColumn3`, () => {
        const html = getTableHtml(AUTHORIZED_CLASS);
        const conteneur = createNode(html);
        conteneur.querySelector('#headColumn2').classList.add(FORBIDDEN_CLASS);
        const headColumn1 = conteneur.querySelector('#headColumn1');

        const actual = NavigationUtilities.getNextElementRight(headColumn1, conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

        const expected = conteneur.querySelector('#headColumn3');
        assert.equal(actual, expected);
      });
      it(`Si je suis sur l'élément headColumn1, que headColumn2 et headColumn3 sont interdits et que je me déplace à droite, l'élément suivant est null`, () => {
        const html = getTableHtml(AUTHORIZED_CLASS);
        const conteneur = createNode(html);
        conteneur.querySelector('#headColumn2').classList.add(FORBIDDEN_CLASS);
        conteneur.querySelector('#headColumn3').classList.add(FORBIDDEN_CLASS);
        const headColumn1 = conteneur.querySelector('#headColumn1');

        const actual = NavigationUtilities.getNextElementRight(headColumn1, conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

        assert.ok(actual === null);
      });
      it(`Si je suis sur l'élément cell1Element1 et que je me déplace à droite, l'élément suivant est cell2Element1`, () => {
        const html = getTableHtml(AUTHORIZED_CLASS);
        const conteneur = createNode(html);
        const cell1Element1 = conteneur.querySelector('#cell1Element1');

        const actual = NavigationUtilities.getNextElementRight(cell1Element1, conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

        const expected = conteneur.querySelector('#cell2Element1');
        assert.equal(actual, expected);
      });
      it(`Si je suis sur l'élément cell1Element1, que cell2Element1 est interdit et que je me déplace à droite, l'élément suivant est cell3Element1`, () => {
        const html = getTableHtml(AUTHORIZED_CLASS);
        const conteneur = createNode(html);
        conteneur.querySelector('#cell2Element1').classList.add(FORBIDDEN_CLASS);
        const cell1Element1 = conteneur.querySelector('#cell1Element1');

        const actual = NavigationUtilities.getNextElementRight(cell1Element1, conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

        const expected = conteneur.querySelector('#cell3Element1');
        assert.equal(actual, expected);
      });
      it(`Si je suis sur l'élément cell1Element1, que tous les éléments à droite sont interdits et que je me déplace à droite, l'élément suivant est null`, () => {
        const html = getTableHtml(AUTHORIZED_CLASS);
        const conteneur = createNode(html);
        conteneur.querySelector('#cell2Element1').classList.add(FORBIDDEN_CLASS);
        conteneur.querySelector('#cell3Element1').classList.add(FORBIDDEN_CLASS);
        const cell1Element1 = conteneur.querySelector('#cell1Element1');

        const actual = NavigationUtilities.getNextElementRight(cell1Element1, conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

        assert.ok(actual === null);
      });
      it(`Si je suis sur l'élément cell1Element2 et que je me déplace à droite, l'élément suivant est cell2Element2`, () => {
        const html = getTableHtml(AUTHORIZED_CLASS);
        const conteneur = createNode(html);
        const cell1Element2 = conteneur.querySelector('#cell1Element2');

        const actual = NavigationUtilities.getNextElementRight(cell1Element2, conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

        const expected = conteneur.querySelector('#cell2Element2');
        assert.equal(actual, expected);
      });
      it(`Si je suis sur l'élément cell2Element2 et que je me déplace à droite, l'élément suivant est null`, () => {
        const html = getTableHtml(AUTHORIZED_CLASS);
        const conteneur = createNode(html);
        const cell2Element2 = conteneur.querySelector('#cell2Element2');

        const actual = NavigationUtilities.getNextElementRight(cell2Element2, conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

        assert.ok(actual === null);
      });
      it(`Si je suis sur l'élément cell1Element3 et que je me déplace à droite, l'élément suivant est null`, () => {
        const html = getTableHtml(AUTHORIZED_CLASS);
        const conteneur = createNode(html);
        const cell1Element3 = conteneur.querySelector('#cell1Element3');

        const actual = NavigationUtilities.getNextElementRight(cell1Element3, conteneur, AUTHORIZED_CLASS, FORBIDDEN_CLASS);

        assert.ok(actual === null);
      });
    });
  });
});

/**
 * Création d'un noeud HTML à partir du code html
 * @param {string} html
 * @returns
 */
function createNode(html) {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content.firstChild;
}
/**
 * Donne le code html pour créer la feuille d'un arbre
 * @param {string} identifiant - Identifiant du noeud
 * @param {string} classList - Chaîne contenant la liste des classes
 */
function getTreeLeafHtml(identifiant, classList) {
  return String.raw`<div id="${ identifiant }" class="${ classList }">
    <div role="treeitem"><section class="item"></section><ol class="items__space" aria-orientation="vertical" role="group"></ol></div>
  </div>`;
}
/**
 * Donne le code html pour créer le noeud d'un arbre
 * @param {string} identifiant - Identifiant du noeud
 * @param {string} classList - Chaîne contenant la liste des classes
 * @param {boolean} opened - Indique si le noeud est ouvert
 * @param {'horizontal'|'vertical'} orientation - Orientation des enfants
 * @param {string} htmlNodes - Code HTML des enfants
 * @returns {string} - Code HTML du noeud
 */

function getTreeNodeHtml(identifiant, classList, opened, orientation, htmlNodes) {
  return String.raw`<div id="${ identifiant }" class="${ classList }">
    <div role="treeitem" aria-expanded="${ opened }">
      <section class="item"></section>
      <ol aria-orientation="${ orientation }" role="group">
        ${ htmlNodes }
      </ol>
    </div>
  </div>`;
}

function getTreesHtml(authorizedClass, orientation) {
  return String.raw`
    <ol aria-orientation="${ orientation }" role="tree">
      ${ getTreeNodeHtml('element1', authorizedClass, true, 'vertical', 
          getTreeLeafHtml('element1-1', authorizedClass) + 
          getTreeLeafHtml('element1-2', authorizedClass) +
          getTreeNodeHtml('element1-3', authorizedClass, true, 'vertical', 
            getTreeLeafHtml('element1-3-1', authorizedClass))) 
      }
      ${ getTreeNodeHtml('element2', authorizedClass, true, 'vertical', 
          getTreeLeafHtml('element2-1', authorizedClass) + 
          getTreeNodeHtml('element2-2', authorizedClass, true, 'vertical', 
            getTreeNodeHtml('element2-2-1', authorizedClass, true, 'vertical',
              getTreeLeafHtml('element2-2-1-1', authorizedClass))) +
          getTreeLeafHtml('element2-3', authorizedClass)) 
      }
      ${ getTreeNodeHtml('element3', authorizedClass, true, 'vertical', 
          getTreeNodeHtml('element3-1', authorizedClass, true, 'vertical', 
            getTreeLeafHtml('element3-1-1', authorizedClass) +
            getTreeLeafHtml('element3-1-2', authorizedClass)) + 
          getTreeNodeHtml('element3-2', authorizedClass, true, 'vertical', 
              getTreeLeafHtml('element3-2-1', authorizedClass))) 
      }
    </ol>`;
}

function getElementHtml(identifiant, classList) {
  return String.raw`<div id="${ identifiant }" class="${ classList }"></div>`;
}
function getListElementHtml(identifiant, classList) {
  return String.raw`<li id="${ identifiant }" class="${ classList }"></li>`;
}

/**
 * Donne le code html pour créer une cellule d'entête de la table
 * @param {string} identifiant - Identifiant de la cellule
 * @param {string} classList - Chaîne contenant la liste des classes
 * @param {number|undefined} colspan - Nombre de colonnes a fusionner 
 * @returns {string} - Code HTML de la cellule
 */
function getTableHeadCellHtml(identifiant, classList, colspan) {
  if (colspan) {
    return String.raw`<th colspan="${ colspan }"><div id="${ identifiant }" class="${ classList }"></div></th>`;
  }
  return String.raw`<th><div id="${ identifiant }" class="${ classList }"></div></th>`;
}
/**
 * Donne le code html pour créer une cellule de ligne de la table
 * @param {string} identifiant - Identifiant de la cellule
 * @param {string} classList - Chaîne contenant la liste des classes
 * @returns {string} - Code HTML de la cellule
 */
function getTableRowCellHtml(identifiant, classList) {
  return String.raw`<td><div id="${ identifiant }" class="${ classList }"></div></td>`;
}

function getTableHtml(authorizedClass) {
  return String.raw`<table role="table">
    <thead>
      <tr aria-orientation="horizontal">
        ${ getTableHeadCellHtml('headTop', authorizedClass, '3') }
      </tr>
      <tr aria-orientation="horizontal">
        ${ getTableHeadCellHtml('headColumn1', authorizedClass) }
        ${ getTableHeadCellHtml('headColumn2', authorizedClass) }
        ${ getTableHeadCellHtml('headColumn3', authorizedClass) }
      </tr>
    </thead>
    <tbody>
      <tr aria-orientation="horizontal">
        <td>
          <ol aria-orientation="vertical">
              ${ getListElementHtml('cell1Element1', authorizedClass) }
              ${ getListElementHtml('cell1Element2', authorizedClass) }
              ${ getListElementHtml('cell1Element3', authorizedClass) }
          </ol>
        </td>
        <td>
          <ol aria-orientation="vertical">
        	    ${ getListElementHtml('cell2Element1', authorizedClass) }
              ${ getListElementHtml('cell2Element2', authorizedClass) }
          </ol>
        </td>
        <td>
          <ol aria-orientation="vertical">
        	    ${ getListElementHtml('cell3Element1', authorizedClass) }
          </ol>
        </td>
      </tr>
    </tbody>
  </table>`;
}
