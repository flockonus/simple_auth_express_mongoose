
rl_sheet = SheetProxy.get_rating_labels

class RLSheetParser < SheetParser
  @@model = RatingLabel
  @@name = "RATING LABELS"
  
  # gets each cell with index, can change attrs
  def cell_reader j, cell, attrs
    attrs[@headers[j]] = cell.cell_to_string if @headers[j] =~ /name/
    attrs['labels'] = [cell.cell_to_string] if @headers[j] == 'rate1'
    attrs['labels'] <<  cell.cell_to_string if ['rate2', 'rate3', 'rate4', 'rate5'].include? @headers[j]
    attrs[@headers[j]] = cell.cell_to_string if @headers[j] =~ /tooltip/
  end
end

RLSheetParser.new( rl_sheet ).run()





