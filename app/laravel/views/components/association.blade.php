                <div class="panel panel-info">                                
                    
                    <div class="panel-heading">                    
                        <h6>associated %AssociatedTableName%</h6><hr>
                    </div>
                    
                    <div class="panel-body">    

                        <form class="form form-inline" role="form" method="POST" action="{{ route('%RoutePrefix%_%TableName%_attach', ['%TableSingularName%' => $%TableSingularName%]) }}">
                            {{ csrf_field() }}
                            
                            <div class="form-group{{ $errors->has('%AssociatedTableSingularName%') ? ' has-error' : '' }}">                            
                                <table class="table table-condensed">
                                    <tr>
                                    <td>
                                        <input id="%AssociatedTableSingularName%" type="text" class="form-control" name="%AssociatedTableSingularName%" value="{{ old('%AssociatedTableSingularName%') }}">
                                    </td>
                                    <td>
                                        <button class="form-control btn btn-success">
                                            Add %AssociatedTableSingularName%
                                        </button>
                                    </td>
                                    </tr>
                                </table>
                                @if ($errors->has("%AssociatedTableSingularName%"))
                                    <span class="help-block">
                                        <strong>{{ $errors->first("%AssociatedTableSingularName%") }}</strong>
                                        </span>
                                @endif
                            </div>
                        </form>                  

                        <table class="table table-responsive">
                            @foreach($%TableSingularName%->%AssociatedTableName% as $%AssociatedTableSingularName%)
                                <tr>
                                    <td>
                                        {{$%AssociatedTableSingularName%->id}}
                                    </td>
                                    <td>
                                        {{$%AssociatedTableSingularName%->name}}
                                    </td>
                                    <td>

                                    <form class="form" role="form" method="POST" action="{{ route('%RoutePrefix%_%TableName%_detach', ['%TableSingularName%' => $%TableSingularName%,'%AssociatedTableSingularName%' => $%AssociatedTableSingularName%]) }}" onsubmit="return confirmation('Confirm permanent desassociation: ' + {{$%AssociatedTableSingularName%->id}});">
                                        {{ csrf_field() }}
                                        <input type="submit" value="Dettach" class="btn btn-danger btn-sm">                                            
                                    </form>                 
                                    </td>
                                </tr>
                            @endforeach                        
                        </table>                        
                    </div>
                </div>