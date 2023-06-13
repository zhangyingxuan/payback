
export class CreateHotListDto {
  // 热门个股大家都在看Top10
  stockNormal: string;

  // 热门个股价值投资Top10
  stockValue: string;

  // 热门概念板块Top5
  plateConcept: string;

  // 热门行业板块Top5
  plateIndustry: string;

  createTime: Date;
}
