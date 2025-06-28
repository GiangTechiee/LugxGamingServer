export class FindAllGameDto {
  game_id: number;
  title: string;
  price: number;
  discount_price?: number;
  platforms: { name: string }[];
  thumbnail?: string;
}