class VisibilityMask {
    constructor(scene) {
        console.time('CONSTRUCTOR');
        this.scene = scene;
        this.player = Phaser.Math.Vector2.ZERO;
        this.graph = this.scene.add.graphics();
        // definitely some redundancy here
        const { width, height, tilewidth, tileheight } = taro.map.data;
        this.width = width;
        this.height = height;
        this.tilewidth = tilewidth;
        this.tileheight = tileheight;
        // vector to store the bottom right boundary of the map
        this.mapExtents = new Phaser.Math.Vector2(
        // x
        this.width * this.tilewidth, 
        // y
        this.height * this.tileheight);
        this.getWalls();
        this.mask = new Phaser.Display.Masks.GeometryMask(scene, this.graph);
        console.timeEnd('CONSTRUCTOR');
    }
    unMaskWalls() {
        this.walls.forEach((wall) => {
            this.graph.fillRectShape(wall);
        });
    }
    getWalls() {
        console.time('GET WALLS');
        this.segments = [];
        this.walls = [];
        taro.$$('wall').forEach((wall) => {
            const x = wall._translate.x - wall._bounds2d.x2;
            const y = wall._translate.y - wall._bounds2d.y2;
            const w = wall._bounds2d.x;
            const h = wall._bounds2d.y;
            this.walls.push(Phaser.Geom.Rectangle.FromXY(x, y, x + w, y + h));
            this.segments.push([[x, y], [x + w, y]], [[x, y + h], [x + w, y + h]], [[x, y], [x, y + h]], [[x + w, y], [x + w, y + h]]);
        });
        console.timeEnd('GET WALLS');
    }
    generateFieldOfView(range) {
        this.range = range;
        // TODO: include map data necessary in event emission for constructor
        this.fov = Phaser.Geom.Rectangle.FromXY(Math.max(0, this.player.x - range), Math.max(0, this.player.y - range), Math.min(this.mapExtents.x, this.player.x + range), Math.min(this.mapExtents.y, this.player.y + range));
    }
    moveCenter(x, y) {
        this.player.set(x, y);
    }
    visibilityPoly() {
        // console.time('VISIBILITY POLYGON');
        const data = VisibilityPolygon.computeViewport([this.player.x, this.player.y], this.segments, [this.fov.left, this.fov.top], [this.fov.right, this.fov.bottom]);
        const poly = [];
        data.forEach((point) => {
            poly.push(new Phaser.Geom.Point(point[0], point[1]));
        });
        this.graph.fillStyle(0xFF9999, 0)
            .fillPoints(poly, true);
        // if include walls
        this.walls.forEach((wall) => {
            this.graph.fillRectShape(wall);
        });
        // console.timeEnd('VISIBILITY POLYGON');
        this.scene.cameras.main.setMask(this.mask, false);
    }
    destroyVisibilityMask() {
        this.graph.clear();
        delete this.mask;
        delete this.graph;
    }
    update() {
        this.graph.clear();
        this.generateFieldOfView(this.range);
        this.visibilityPoly();
    }
}
if (typeof (module) !== 'undefined' && typeof (module.exports) !== 'undefined') {
    module.exports = VisibilityMask;
}
//# sourceMappingURL=VisibilityMask.js.map