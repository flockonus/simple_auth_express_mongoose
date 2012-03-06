
game_sheet = SheetProxy.get_games

class GameSheetParser < SheetParser
  @@model = Game
  @@name = "GAME"
  
  # gets each cell with index, can change attrs
  def cell_reader j, cell, attrs
    attrs[@headers[j]] = cell.cell_to_string if @headers[j] =~ /name/
    attrs[@headers[j]] = cell.cell_to_date if @headers[j] =~ /published_date/
    attrs[@headers[j]] = cell.cell_to_array if ['platforms', 'genres', 'tags'].include? @headers[j]
  end
end

GameSheetParser.new( game_sheet ).run()





